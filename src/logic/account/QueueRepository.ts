import Account from "../../components/account/Account";
import { NetworkConfig } from "../../components/provider/AppSettingsProvider";
import { QueuedInteractionsDB, QueuedSafeTransaction } from "../db/interactions";
import { SafeTransaction } from "../models/transactions";

export class QueueRepository {
    db: QueuedInteractionsDB
    account: Account
    networkConfig: NetworkConfig

    constructor(account: Account, networkConfig: NetworkConfig) {
        this.account = account
        this.networkConfig = networkConfig
        this.db = new QueuedInteractionsDB(account.id)
    }

    async addTx(tx: SafeTransaction) {
        await this.db.add({
            id: "",
            ...tx
        })
    }

    async getTx(hash: string): Promise<QueuedSafeTransaction> {
        return this.db.get(hash)
    }

    async getAllTxs(): Promise<QueuedSafeTransaction[]> {
        return this.db.getAll()
    }

}