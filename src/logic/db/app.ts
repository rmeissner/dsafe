import { Account } from "../utils/account";
import { AbstractDAO, AbstractDB } from "./base";

export const ACCOUNTS_STORE = "accounts"
export const ACCOUNTS_KEY = "id"
export const ACCOUNTS_INDEX = "timestamp"

export const ACCOUNTS_INIT_STORE = "acc_initializers"
export const ACCOUNTS_INIT_KEY = "id"

export const APP_URLS_STORE = "app_urls"
export const APP_URLS_KEY = "id"
export const APP_URLS_INDEX = "timestamp"

export interface StoredAccount extends Account {
    timestamp: number
}

export interface AccountInitializer extends Account {
    initializerTo: string
    initializerData: string
    signers: string[]
    threshold: number
    salt: string
    version: string
}

export interface StoredAppUrls {
    id: string,
    timestamp: number
}

export class AppDB extends AbstractDB {
    constructor() {
        super("app_state", 3, (db, oldVersion) => {
            if (oldVersion < 1) {
                const store = db.createObjectStore(ACCOUNTS_STORE, { keyPath: ACCOUNTS_KEY })
                store.createIndex(ACCOUNTS_INDEX, ACCOUNTS_INDEX, { unique: false })
            }
            if (oldVersion < 2) {
                const store = db.createObjectStore(APP_URLS_STORE, { keyPath: APP_URLS_KEY })
                store.createIndex(APP_URLS_INDEX, APP_URLS_INDEX, { unique: false })
            }
            if (oldVersion < 3) {
                const store = db.createObjectStore(ACCOUNTS_INIT_STORE, { keyPath: ACCOUNTS_INIT_KEY })
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

export class AccountInitializerDAO extends AbstractDAO<AccountInitializer> {
    constructor() {
        super(new AppDB(), ACCOUNTS_INIT_STORE)
    }

    getAll(): Promise<AccountInitializer[]> {
        return this.getAllByIndex(ACCOUNTS_INIT_KEY)
    }
}

export class AppUrlsDAO extends AbstractDAO<StoredAppUrls> {
    constructor() {
        super(new AppDB(), APP_URLS_STORE)
    }

    getAll(): Promise<StoredAppUrls[]> {
        return this.getAllByIndex(APP_URLS_INDEX)
    }
}
