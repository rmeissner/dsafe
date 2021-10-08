import { Account } from "../utils/account";
import { AbstractDAO, AbstractDB } from "./base";

export const ACCOUNTS_STORE = "accounts"
export const ACCOUNTS_KEY = "id"
export const ACCOUNTS_INDEX = "timestamp"

export interface StoredAccount extends Account {
    timestamp: number
}

export class AppDB extends AbstractDB {
    constructor() {
        super("app_state", 1, (db, oldVersion) => {
            if (oldVersion < 1) {
                const store = db.createObjectStore(ACCOUNTS_STORE, { keyPath: ACCOUNTS_KEY })
                store.createIndex(ACCOUNTS_INDEX, ACCOUNTS_INDEX, { unique: false })
            }
        });
    }
}

export class AccountsDAO extends AbstractDAO<StoredAccount> {
    constructor() {
        super(new AppDB(), ACCOUNTS_STORE)
    }

    getAll(): Promise<StoredAccount[]> {
        return this.getAllByIndex(ACCOUNTS_INDEX)
    }

}
