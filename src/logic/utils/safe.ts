import { Contract, PopulatedTransaction } from "@ethersproject/contracts";
import { safeInterface, SignedSafeTransaction } from "safe-indexer-ts";
import { ethers, BigNumber, Signer } from "ethers";
import { SafeTransaction } from "../models/transactions";

export interface SafeStatus {
    nonce: BigNumber,
    threshold: BigNumber,
    owners: string[],
    version: string
}

export class Safe {
    protected readonly safeContract: Contract

    constructor(address: string, providerOrSigner?: ethers.providers.Provider | Signer) {
        this.safeContract = new Contract(address, safeInterface, providerOrSigner)
    }

    writable(signer: Signer): WritableSafe {
        return new WritableSafe(this.safeContract.address, signer)
    }

    nonce(): Promise<BigNumber> {
        return this.safeContract.nonce()
    }

    owners(): Promise<string> {
        return this.safeContract.getOwners()
    }

    async status(): Promise<SafeStatus> {
        const information = await Promise.all([
            this.safeContract.nonce(),
            this.safeContract.getThreshold(),
            this.safeContract.getOwners(),
            this.safeContract.VERSION(),
        ])
        return {
            nonce: information[0],
            threshold: information[1],
            owners: information[2],
            version: information[3]
        }
    }

    async getTransactionHash(tx: SafeTransaction): Promise<{ hash: string, version: string }> {
        const hash: string = await this.safeContract.getTransactionHash(
            tx.to,
            tx.value,
            tx.data,
            tx.operation,
            tx.safeTxGas,
            tx.baseGas,
            tx.gasPrice,
            tx.gasToken,
            tx.refundReceiver,
            tx.nonce
        )
        const version: string = await this.safeContract.VERSION()
        return { hash, version }
    }

    populateTx(tx: SignedSafeTransaction): Promise<PopulatedTransaction> {
        return this.safeContract.populateTransaction.execTransaction(
            tx.to,
            tx.value, 
            tx.data, 
            tx.operation, 
            tx.safeTxGas, 
            tx.baseGas, 
            tx.gasPrice, 
            tx.gasToken, 
            tx.refundReceiver, 
            tx.signatures
        )
    }
}

export class WritableSafe extends Safe {
    constructor(address: string, signer: Signer) {
        super(address, signer)
    }

    executeTx(tx: SignedSafeTransaction): Promise<string> {
        return this.safeContract.execTransaction(
            tx.to,
            tx.value, 
            tx.data, 
            tx.operation, 
            tx.safeTxGas, 
            tx.baseGas, 
            tx.gasPrice, 
            tx.gasToken, 
            tx.refundReceiver, 
            tx.signatures
        )
    }
}