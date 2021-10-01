import { providers } from "ethers";
import Account from "../../components/account/Account";
import { QueuedInteractionsDAO, QueuedSafeTransaction } from "../db/interactions";
import { SafeTransaction } from "../models/transactions";
import { Safe } from "../utils/safe";

export class QueueRepository {
    db: QueuedInteractionsDAO
    account: Account
    safe: Safe

    constructor(account: Account, provider?: providers.Provider) {
        this.account = account
        this.db = new QueuedInteractionsDAO(account.id)
        this.safe = new Safe(account.address, provider)
    }

    async addTx(tx: SafeTransaction): Promise<QueuedSafeTransaction> {
        const hashInfo = await this.safe.getTransactionHash(tx)
        const queuedTx = {
            id: hashInfo.hash,
            version: hashInfo.version,
            ...tx
        }
        await this.db.add(queuedTx)
        return queuedTx
    }

    async getTx(hash: string): Promise<QueuedSafeTransaction> {
        return this.db.get(hash)
    }

    async getQueuedTxs(): Promise<QueuedSafeTransaction[]> {
        const nonce = await this.safe.nonce()
        console.log(nonce.toString())
        return this.db.getAll(nonce.toString())
    }

}