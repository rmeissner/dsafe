import { providers, Signer } from "ethers";
import Account from "../../components/account/Account";
import { QueuedInteractionsDAO, QueuedSafeTransaction, TxSignaturesDAO } from "../db/interactions";
import { SafeTransaction, SafeTransactionSignature } from "../models/transactions";
import { buildSignatureBytes, prepareSignatures } from "../utils/execution";
import { Safe } from "../utils/safe";

export class QueueRepository {
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

    async addTx(tx: SafeTransaction): Promise<QueuedSafeTransaction> {
        const hashInfo = await this.safe.getTransactionHash(tx)
        const queuedTx = {
            id: hashInfo.hash,
            version: hashInfo.version,
            ...tx
        }
        await this.queueDao.add(queuedTx)
        return queuedTx
    }

    async getTx(hash: string): Promise<QueuedSafeTransaction> {
        return this.queueDao.get(hash)
    }

    async getQueuedTxs(): Promise<QueuedSafeTransaction[]> {
        const nonce = await this.safe.nonce()
        return this.queueDao.getAll(nonce.toString())
    }

    async getSignatures(hash: string): Promise<SafeTransactionSignature[]> {
        return this.signaturesDao.getAll(hash)
    }

    async addSignature(signature: SafeTransactionSignature): Promise<void> {
        await this.signaturesDao.add(signature)
    }

    async submitTx(tx: QueuedSafeTransaction, submitter: Signer, signatures: SafeTransactionSignature[]): Promise<string> {
        const writableSafe = this.safe.writable(submitter)
        const status = await this.safe.status()
        if (status.nonce.toString() !== tx.nonce) throw Error(`Unexpected nonce! Expected ${status.nonce} got ${tx.nonce}`)
        const submitterAddress = await submitter.getAddress()
        const signatureBytes = buildSignatureBytes(await prepareSignatures(status, tx, signatures, submitterAddress))
        const signedTx = {
            signatures: signatureBytes,
            ...tx
        }
        return writableSafe.executeTx(signedTx)
    }

}