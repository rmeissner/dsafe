import { providers, Signer, BigNumber } from "ethers";
import { PopulatedTransaction } from "@ethersproject/contracts";
import { QueuedInteractionsDAO, QueuedSafeTransaction, TxSignaturesDAO } from "../db/interactions";
import { SafeTransaction, SafeTransactionSignature, SignedSafeTransaction } from "../models/transactions";
import { Account } from "../utils/account";
import { buildSignatureBytes, prepareSignatures } from "../utils/execution";
import { Safe } from "../utils/safe";

export interface QueueRepositoryUpdates {
    onNewTx: () => void
}

export class QueueRepository {
    callbacks: Set<QueueRepositoryUpdates> = new Set()
    queueDao: QueuedInteractionsDAO
    signaturesDao: TxSignaturesDAO
    account: Account
    safe: Safe

    constructor(account: Account, provider?: providers.Provider) {
        this.account = account
        this.queueDao = new QueuedInteractionsDAO(account.id)
        this.signaturesDao = new TxSignaturesDAO(account.id)
        this.safe = new Safe(account.address, provider)
    }

    registerCallback(callback: QueueRepositoryUpdates) {
        this.callbacks.add(callback)
    }

    unregisterCallback(callback: QueueRepositoryUpdates) {
        this.callbacks.delete(callback)
    }

    private notifyNewTxs() {
        this.callbacks.forEach((callback) => { 
            try {
                callback.onNewTx()
            } catch (e) {
                console.log(e)
            }
        })
    }

    async addTx(tx: SafeTransaction): Promise<QueuedSafeTransaction> {
        const hashInfo = await this.safe.getTransactionHash(tx)
        const queuedTx = {
            id: hashInfo.hash,
            version: hashInfo.version,
            ...tx
        }
        await this.queueDao.add(queuedTx)
        this.notifyNewTxs()
        return queuedTx
    }

    async deleteTx(id: string): Promise<void> {
        await this.queueDao.remove(id)
        this.notifyNewTxs()
    }

    async getTx(hash: string): Promise<QueuedSafeTransaction> {
        return this.queueDao.get(hash)
    }

    async getQueuedTxs(): Promise<QueuedSafeTransaction[]> {
        const nonce = await this.safe.nonce()
        return this.queueDao.getAll(nonce.toNumber())
    }

    async getNextNonce(): Promise<string> {
        const queuedTxs = await this.getQueuedTxs()
        if (queuedTxs.length > 0) {
            return BigNumber.from(queuedTxs[queuedTxs.length - 1].nonce).add(1).toString()
        }
        return (await this.safe.nonce()).toString()
    }

    async getSignatures(hash: string): Promise<SafeTransactionSignature[]> {
        return this.signaturesDao.getAll(hash)
    }

    async addSignature(signature: SafeTransactionSignature): Promise<void> {
        await this.signaturesDao.add(signature)
    }

    async signedTx(tx: QueuedSafeTransaction, signatures: SafeTransactionSignature[], submitterAddress?: string): Promise<SignedSafeTransaction> {
        const status = await this.safe.status()
        if (status.nonce.toNumber() !== tx.nonce) throw Error(`Unexpected nonce! Expected ${status.nonce} got ${tx.nonce}`)
        const signatureBytes = buildSignatureBytes(await prepareSignatures(status, tx, signatures, submitterAddress))
        return {
            signatures: signatureBytes,
            ...tx
        }
    }

    async submitTx(tx: QueuedSafeTransaction, submitter: Signer, signatures: SafeTransactionSignature[]): Promise<string> {
        const writableSafe = this.safe.writable(submitter)
        const submitterAddress = await submitter.getAddress()
        const signedTx = await this.signedTx(tx, signatures, submitterAddress)
        return writableSafe.executeTx(signedTx)
    }

    async populateTx(tx: QueuedSafeTransaction, signatures: SafeTransactionSignature[]): Promise<PopulatedTransaction> {
        const signedTx = await this.signedTx(tx, signatures)
        return await this.safe.populateTx(signedTx)
    }

}