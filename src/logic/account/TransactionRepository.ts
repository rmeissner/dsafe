import { on } from "cluster";
import { providers } from "ethers";
import { Callback, IndexerStatus, SafeIndexer, SafeInteraction } from "safe-indexer-ts";
import Account from "../../components/account/Account";
import { NetworkConfig } from "../../components/provider/AppSettingsProvider";
import { InteractionsDB } from "../db/interactions";
import { IndexerState } from "../state/indexer";
import { getIndexer } from "../utils/indexer";

export class TransactionRepository implements Callback {
    callbacks: Set<Callback> = new Set()
    indexer: SafeIndexer | undefined
    db: InteractionsDB
    account: Account
    networkConfig: NetworkConfig

    constructor(account: Account, networkConfig: NetworkConfig) {
        this.account = account
        this.networkConfig = networkConfig
        this.db = new InteractionsDB(account.id)
    }

    connect(provider: providers.Provider): () => void {
        this.disconnect()
        const indexer = getIndexer(this.account, provider, this.networkConfig, this)
        this.indexer = indexer
        indexer.start().catch((e) => console.error(e))
        return () => {
            indexer.stop()
        }
    }

    disconnect() {
        this.indexer?.stop()
    }

    registerCallback(callback: Callback) {
        this.callbacks.add(callback)
    }

    unregisterCallback(callback: Callback) {
        this.callbacks.delete(callback)
    }

    onNewInteractions(interactions: SafeInteraction[]) {
        interactions.forEach((interaction) => { this.db.add(interaction) })
        this.callbacks.forEach((callback) => {
            try {
                callback.onNewInteractions(interactions)
            } catch (e) {
                console.log(e)
            }
        })
    }

    onStatusUpdate(update: IndexerStatus) {
        this.callbacks.forEach((callback) => {
            try {
                callback.onStatusUpdate?.(update)
            } catch (e) {
                console.log(e)
            }
        })
    }

    async getTx(id: string): Promise<SafeInteraction> {
        return this.db.get(id)
    }

    async getAllTxs(): Promise<SafeInteraction[]> {
        return this.db.getAll()
    }

    async reindex(): Promise<boolean> {
        const indexer = this.indexer
        if (!indexer) return false;
        indexer.pause();
        await this.db.drop();
        (indexer.state as IndexerState).reset();
        indexer.resume();
        return true
    }

}