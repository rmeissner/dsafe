import { AbstractDB } from "./base";

export const INTERACTIONS_STORE = "interactions"
export const INTERACTIONS_KEY = "id"
export const INTERACTIONS_INDEX = "timestamp"
export const QUEUED_TX_KEY = "id"
export const QUEUED_TX_STORE = "queued_tx"
export const QUEUED_TX_INDEX = "nonce"

export class SafeDB extends AbstractDB {
    constructor(safe: string) {
        super(safe, 2, (db, oldVersion) => {
            if (oldVersion < 1) {
                const store = db.createObjectStore(INTERACTIONS_STORE, { keyPath: INTERACTIONS_KEY })
                store.createIndex(INTERACTIONS_INDEX, INTERACTIONS_INDEX, { unique: false })
            }
            if (oldVersion < 2) {
                const store = db.createObjectStore(QUEUED_TX_STORE, { keyPath: QUEUED_TX_KEY })
                store.createIndex(QUEUED_TX_INDEX, QUEUED_TX_INDEX, { unique: false })
            }
        });
    }
}