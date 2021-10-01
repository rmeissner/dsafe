import { Contract } from "@ethersproject/contracts";
import { safeInterface } from "safe-indexer-ts";
import { ethers } from "safe-indexer-ts/node_modules/ethers";
import { SafeTransaction } from "../models/transactions";

export class Safe {
    safeContract: Contract

    constructor(address: string, provider?: ethers.providers.Provider) {
        this.safeContract = new Contract(address, safeInterface, provider)
    }

    nonce(): Promise<string> {
        return this.safeContract.nonce()
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

}