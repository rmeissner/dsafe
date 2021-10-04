import { providers } from "ethers";
import { Callback, IndexerStatus, SafeIndexer, SafeInteraction } from "safe-indexer-ts";
import Account from "../../components/account/Account";
import { NetworkConfig } from "../../components/provider/AppSettingsProvider";
import { InteractionsDAO } from "../db/interactions";
import { IndexerState } from "../state/indexer";
import { getIndexer } from "../utils/indexer";


export class TransactionRepository implements Callback {
    callbacks: Set<Callback> = new Set()
    currentStatus: IndexerStatus | undefined
    indexer: SafeIndexer | undefined
    state: IndexerState
    db: InteractionsDAO
    account: Account
    networkConfig: NetworkConfig

    constructor(account: Account, networkConfig: NetworkConfig) {
        this.account = account
        this.networkConfig = networkConfig
        this.db = new InteractionsDAO(account.id)
        this.state = new IndexerState(account.id, networkConfig.startingBlock)
    }

    connect(provider: providers.Provider): () => void {
        this.disconnect()
        const indexer = getIndexer(this.account, provider, this.state, this.networkConfig, this)
        this.indexer = indexer
        indexer.start().catch((e) => console.error(e))
        indexer.start(true).catch((e) => console.error(e))
        return () => {
            this.disconnect()
        }
    }

    disconnect() {
        this.indexer?.stop()
        this.currentStatus = undefined
    }

    registerCallback(callback: Callback) {
        this.callbacks.add(callback)
    }

    unregisterCallback(callback: Callback) {
        this.callbacks.delete(callback)
        this.postCurrentStatusUpdateToCallback(callback)
    }

    private checkForCreation(interactions: SafeInteraction[]) {
        for (const interaction of interactions) {
            console.log(interaction)
            if (interaction.type === "setup" || (
                interaction.type === "multisig_transaction" && interaction.details?.nonce === 0
            )) {
                console.log("Found creation, stop reverse indexing")
                this.indexer?.updateConfig({
                    earliestBlock: Math.max(0, interaction.block - this.networkConfig.maxBlocks)
                })
                return
            }
        }
    }

    private async handleNewInteraction(interaction: SafeInteraction) {
        try {
            await this.db.add(interaction)
        } catch (e) {
            console.error(e)
        }
    }

    onNewInteractions(interactions: SafeInteraction[]) {
        this.checkForCreation(interactions)
        interactions.forEach((i) => { this.handleNewInteraction(i) })
        this.callbacks.forEach((callback) => {
            try {
                callback.onNewInteractions(interactions)
            } catch (e) {
                console.log(e)
            }
        })
    }

    onStatusUpdate(update: IndexerStatus) {
        this.currentStatus = update
        this.postCurrentStatusUpdate()
    }

    private postCurrentStatusUpdate() {
        if (!this.currentStatus) return
        this.callbacks.forEach((cb) => { this.postCurrentStatusUpdateToCallback(cb) })
    }

    private postCurrentStatusUpdateToCallback(callback: Callback) {
        const currentStatus = this.currentStatus
        if (!currentStatus) return
        try {
            callback.onStatusUpdate?.(currentStatus)
        } catch (e) {
            console.log(e)
        }
    }

    async getTx(id: string): Promise<SafeInteraction> {
        return this.db.get(id)
    }

    async getAllTxs(): Promise<SafeInteraction[]> {
        return this.db.getAll()
    }

    async reindex(): Promise<boolean> {
        this.currentStatus = undefined
        const indexer = this.indexer
        if (!indexer) return false;
        indexer.pause();
        await this.db.drop();
        this.state.reset();
        indexer.resume();
        return true
    }

}