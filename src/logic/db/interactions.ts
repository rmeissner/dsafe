import { SafeInteraction } from "safe-indexer-ts";
import { SafeTransaction } from "../models/transactions";
import { AbstractDAO } from "./base";
import { INTERACTIONS_INDEX, INTERACTIONS_STORE, QUEUED_TX_INDEX, QUEUED_TX_STORE, SafeDB } from "./safe";


export class InteractionsDAO extends AbstractDAO<SafeInteraction> {
    constructor(safe: string) {
        super(new SafeDB(safe), INTERACTIONS_STORE)
    }

    getAll(): Promise<SafeInteraction[]> {
        return this.getAllByIndex(INTERACTIONS_INDEX)
    }

}

export interface QueuedSafeTransaction extends SafeTransaction {
    id: string
    version: string
}

export class QueuedInteractionsDAO extends AbstractDAO<QueuedSafeTransaction> {
    constructor(safe: string) {
        super(new SafeDB(safe), QUEUED_TX_STORE)
    }

    getAll(nonce: string): Promise<QueuedSafeTransaction[]> {
        return this.getAllByIndex(QUEUED_TX_INDEX, IDBKeyRange.lowerBound(nonce))
    }

}