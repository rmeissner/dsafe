import { SafeInteraction } from "safe-indexer-ts";
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