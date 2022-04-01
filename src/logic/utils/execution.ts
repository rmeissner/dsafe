import { arrayify } from "@ethersproject/bytes";
import { equal } from "assert";
import { ethers } from "ethers";
import { QueuedSafeTransaction } from "../db/interactions";
import { SafeTransactionSignature } from "../models/transactions";
import { SafeStatus } from "./safe";
import { buildPreValidatedSignature } from "./signatures";

export const prepareSignatures = async (status: SafeStatus, tx: QueuedSafeTransaction, signatures: SafeTransactionSignature[], submitterAddress?: string): Promise<SafeTransactionSignature[]> => {
    const submitterIsOwner = submitterAddress && status.owners.indexOf(submitterAddress) >= 0
    const requiredSigntures = submitterIsOwner ? status.threshold.sub(1) : status.threshold
    const signatureArray = []
    if (submitterIsOwner) {
        signatureArray.push(await buildPreValidatedSignature(submitterAddress, tx))
    }
    if (requiredSigntures.eq(0)) return signatureArray
    const signatureMap = new Map<String, SafeTransactionSignature>()
    for (const signature of signatures) {
        if (status.owners.indexOf(signature.signer) < 0) continue
        if (submitterAddress === signature.signer || signatureMap.has(signature.signer)) continue
        signatureMap.set(signature.signer, signature)
    }
    if (requiredSigntures.toNumber() > signatureMap.size) throw Error(`Not enough signatures (${signatureMap.size} of ${requiredSigntures})`)
    return signatureArray.concat(Array.from(signatureMap.values()).slice(0, requiredSigntures.toNumber()))
}

const buildStaticPart = (signature: SafeTransactionSignature, offset: number): string => {
    // TODO: can we refactor this out
    switch (signature.type) {
        case "contract":
            return "" +
                ethers.utils.defaultAbiCoder.encode(["address"], [signature.signer]).slice(2) +
                ethers.utils.defaultAbiCoder.encode(["uint256"], [offset]).slice(2) +
                "00"
        case "eip712":
        case "pre_validated":
        case "eth_sign":
            return signature.data.slice(2)
    }
}

const buildDynamicPart = (signature: SafeTransactionSignature): string => {
    // TODO: can we refactor this out
    switch (signature.type) {
        case "contract":
            return ethers.utils.defaultAbiCoder.encode(["bytes"], [arrayify(signature.data)]).slice(2)
        case "eip712":
        case "pre_validated":
        case "eth_sign":
            return ""
    }
}

export const buildSignatureBytes = (signatures: SafeTransactionSignature[]): string => {
    signatures.sort((left, right) => left.signer.toLowerCase().localeCompare(right.signer.toLowerCase()))
    let staticParts = ""
    let dynamicParts = ""
    for (const sig of signatures) {
        staticParts += buildStaticPart(sig, dynamicParts.length / 2)
        dynamicParts += buildDynamicPart(sig)
    }
    return "0x" + staticParts + dynamicParts
}