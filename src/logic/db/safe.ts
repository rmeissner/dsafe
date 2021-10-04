import { AbstractDB } from "./base";

export const INTERACTIONS_STORE = "interactions"
export const INTERACTIONS_KEY = "id"
export const INTERACTIONS_INDEX = "timestamp"

export const QUEUED_TX_STORE = "queued_tx"
export const QUEUED_TX_KEY = "id"
export const QUEUED_TX_INDEX = "nonce"

export const TX_SIGNATURES_STORE = "tx_signatures"
export const TX_SIGNATURES_KEY = "id"
export const TX_SIGNATURES_INDEX = "safeTxHash"

export class SafeDB extends AbstractDB {
    constructor(safe: string) {
        super(safe, 3, (db, oldVersion) => {
            if (oldVersion < 1) {
                const store = db.createObjectStore(INTERACTIONS_STORE, { keyPath: INTERACTIONS_KEY })
                store.createIndex(INTERACTIONS_INDEX, INTERACTIONS_INDEX, { unique: false })
            }
            if (oldVersion < 2) {
                const store = db.createObjectStore(QUEUED_TX_STORE, { keyPath: QUEUED_TX_KEY })
                store.createIndex(QUEUED_TX_INDEX, QUEUED_TX_INDEX, { unique: false })
            }
            if (oldVersion < 3) {
                const store = db.createObjectStore(TX_SIGNATURES_STORE, { keyPath: TX_SIGNATURES_KEY })
                store.createIndex(TX_SIGNATURES_INDEX, TX_SIGNATURES_INDEX, { unique: false })
            }
        });
    }
}