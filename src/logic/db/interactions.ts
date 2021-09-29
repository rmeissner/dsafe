import { SafeInteraction } from "safe-indexer-ts";
import { SafeTransaction } from "../models/transactions";
import { AbstractDB } from "./base";


export class InteractionsDB extends AbstractDB<SafeInteraction> {

    readonly indexKey = "timestamp"

    constructor(safe: string) {
        super(safe, 1, "interactions", (db, oldVersion) => {
            if (oldVersion < 1) {
                const store = db.createObjectStore(this.storeName, { keyPath: "id" })
                store.createIndex(this.indexKey, this.indexKey, { unique: false })
            }
        });
    }

    getAll(): Promise<SafeInteraction[]> {
        return this.getAllByIndex(this.indexKey)
    }

}

export interface QueuedSafeTransaction extends SafeTransaction {
    id: string
}

export class QueuedInteractionsDB extends AbstractDB<QueuedSafeTransaction> {

    readonly indexKey = "nonce"

    constructor(safe: string) {
        super(safe, 1, "queued_interactions", (db, oldVersion) => {
            if (oldVersion < 1) {
                const store = db.createObjectStore(this.storeName, { keyPath: "id" })
                store.createIndex(this.indexKey, this.indexKey, { unique: false })
            }
        });
    }

    getAll(): Promise<QueuedSafeTransaction[]> {
        return this.getAllByIndex(this.indexKey)
    }

}