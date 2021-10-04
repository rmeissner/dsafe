import { Signer, TypedDataSigner, TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { arrayify } from "@ethersproject/bytes";
import { ethers } from "ethers";
import Account from "../../components/account/Account";
import { QueuedSafeTransaction } from "../db/interactions";
import { SafeTransactionSignature } from "../models/transactions";

export type SafeSignatureType = "eip712" | "eth_sign" | "pre_validated" | "contract"

const recoverEthSign = (safeTxHash: string, signature: string) => {
    const hash = ethers.utils.hashMessage(ethers.utils.arrayify(safeTxHash))
    // TODO: adjust v
    return ethers.utils.recoverAddress(hash, signature)
}

const recoverEIP712 = (safeTxHash: string, signature: string) => {
    return ethers.utils.recoverAddress(safeTxHash, signature)
}

const recoverPreValidated = async (signature: string) => {
    // TODO: add on-chain check
    return signature.slice(0, 66)
}

export const checkSafeTransactionSignature = async (signature: SafeTransactionSignature) => {
    let signer;
    switch (signature.type) {
        case "eth_sign": {
            signer = recoverEthSign(signature.safeTxHash, signature.data)
            break
        }
        case "eip712": {
            signer = recoverEIP712(signature.safeTxHash, signature.data)
            break
        }
        case "pre_validated": {
            signer = recoverPreValidated(signature.data)
            break
        }
        case "contract": {
            throw Error("Contract signatures not supported yet")
        }
        default: {
            throw Error("Unknown signature type")
        }
    }
    if (signer !== signature.signer) throw Error(`Unexpected signer! Expected ${signature.signer} got ${signer}`)
}

export const shareableSignatureString = (signature: SafeTransactionSignature): string => {
    return `${signature.data}:${signature.signer}:${signature.safeTxHash}:${signature.type}`
}

export const parseSafeSignature = async (signatureString: string, safeTxHash?: string, sigType?: SafeSignatureType): Promise<SafeTransactionSignature> => {
    const signatureParts = signatureString.split(":")
    if (
        (signatureParts.length == 2 && !safeTxHash && !sigType) ||
        (signatureParts.length == 3 && !sigType) ||
        signatureParts.length != 4
    ) {
        throw Error("Missing Safe signature info")
    }
    const data = signatureParts[0]
    const signer = signatureParts[1]
    const hash = safeTxHash || signatureParts[2]
    // TODO: verify signature type
    const type = sigType || signatureParts[3] as SafeSignatureType
    const id = ethers.utils.keccak256(data + hash)
    return {
        id,
        type,
        signer,
        safeTxHash: hash,
        data
    }
}

export const parseSignatureType = (signature: string): SafeSignatureType => {
    const sigType = signature.slice(-2)
    switch(sigType) {
        case "00": {
            return "contract" // contract signature (aka old eip 1271 version)
        }
        case "01": {
            return "pre_validated" // pre-validated signature
        }
        case "1b": 
        case "1c": {
            return "eip712" // Typed Data based signature
        }
        case "1f": 
        case "20": {
            return "eth_sign" // eth_sign based signature
        }
        default: 
            throw Error("Unknown signature type")
    }
}

const getEIP712Domain = (version: string, account: Account): TypedDataDomain => {
    switch (version) {
        case "1.3.0": {
            return {
                verifyingContract: account.address,
                chainId: account.chainId
            }
        }
        default: {
            return { verifyingContract: account.address }
        }
    }
}

const getEIP712TxType = (version: string): Record<string, TypedDataField[]> => {
    switch (version) {
        case "0.1.0": {
            return {
                SafeTx: [
                    { type: "address", name: "to" },
                    { type: "uint256", name: "value" },
                    { type: "bytes", name: "data" },
                    { type: "uint8", name: "operation" },
                    { type: "uint256", name: "safeTxGas" },
                    { type: "uint256", name: "dataGas" },
                    { type: "uint256", name: "gasPrice" },
                    { type: "address", name: "gasToken" },
                    { type: "address", name: "refundReceiver" },
                    { type: "uint256", name: "nonce" },
                ]
            }
        }
        default: {
            return {
                SafeTx: [
                    { type: "address", name: "to" },
                    { type: "uint256", name: "value" },
                    { type: "bytes", name: "data" },
                    { type: "uint8", name: "operation" },
                    { type: "uint256", name: "safeTxGas" },
                    { type: "uint256", name: "baseGas" },
                    { type: "uint256", name: "gasPrice" },
                    { type: "address", name: "gasToken" },
                    { type: "address", name: "refundReceiver" },
                    { type: "uint256", name: "nonce" },
                ]
            }
        }
    }
}

const signEip712 = async (signer: Signer & TypedDataSigner, account: Account, transaction: QueuedSafeTransaction): Promise<SafeTransactionSignature> => {
    const signatureString = await signer._signTypedData(
        getEIP712Domain(transaction.version, account),
        getEIP712TxType(transaction.version),
        transaction
    )
    const signerAddress = await signer.getAddress()
    const recoveredAddress = recoverEIP712(transaction.id, signatureString)
    if (recoveredAddress !== signerAddress) {
        // ToDo: check contract signature
        throw Error(`Unexpected signer! Expected ${signerAddress} got ${recoveredAddress}`)
    }
    return {
        type: "eip712",
        id: signatureString,
        signer: signerAddress,
        data: signatureString,
        safeTxHash: transaction.id
    }
}

const signMessage = async (signer: Signer & TypedDataSigner, transaction: QueuedSafeTransaction): Promise<SafeTransactionSignature> => {
    const signatureString = await signer.signMessage(arrayify(transaction.id))
    const signerAddress = await signer.getAddress()
    const recoveredAddress = recoverEthSign(transaction.id, signatureString)
    if (recoveredAddress !== signerAddress) {
        // ToDo: check contract signature
        throw Error(`Unexpected signer! Expected ${signerAddress} got ${recoveredAddress}`)
    }
    return {
        type: "eth_sign",
        id: signatureString,
        signer: signerAddress,
        data: signatureString,
        safeTxHash: transaction.id
    }
}

export const buildPreValidatedSignature = async (signerAddress: string, transaction: QueuedSafeTransaction): Promise<SafeTransactionSignature> => {
    const signature = "0x000000000000000000000000" + signerAddress.slice(2) + "0000000000000000000000000000000000000000000000000000000000000000" + "01"
    return {
        id: signature + transaction.id,
        safeTxHash: transaction.id,
        type: "pre_validated",
        signer: signerAddress,
        data: signature,
    }
}

export const signQueuedTx = async (signer: Signer & TypedDataSigner, account: Account, transaction: QueuedSafeTransaction): Promise<SafeTransactionSignature> => {
    try {
        return await signEip712(signer, account, transaction)
    } catch (e: any) {
        if (e.code && e.code === 4001) {
            console.warn("User canceled signing")
            throw e
        }
        console.warn("Could not sign with EIP-712")
    }
    return await signMessage(signer, transaction) 
}