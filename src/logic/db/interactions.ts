import { SafeInteraction } from "safe-indexer-ts";
import { SafeTransaction, SafeTransactionSignature } from "../models/transactions";
import { AbstractDAO } from "./base";
import { INTERACTIONS_INDEX, INTERACTIONS_STORE, QUEUED_TX_INDEX, QUEUED_TX_STORE, SafeDB, TX_SIGNATURES_INDEX, TX_SIGNATURES_STORE } from "./safe";


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

export class TxSignaturesDAO extends AbstractDAO<SafeTransactionSignature> {
    constructor(safe: string) {
        super(new SafeDB(safe), TX_SIGNATURES_STORE)
    }

    getAll(safeTxHash: string): Promise<SafeTransactionSignature[]> {
        return this.getAllByIndex(TX_SIGNATURES_INDEX, safeTxHash)
    }
}