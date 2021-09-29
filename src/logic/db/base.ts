export abstract class AbstractDB<T> {
    private internalDb: IDBDatabase | undefined;
    private indexedDB = window.indexedDB;
    readonly dbKey: string;
    readonly dbVersion: number;
    readonly storeName: string;
    readonly migration: (db: IDBDatabase, oldVersion: number, newVersion: number) => void;

    constructor(dbKey: string, dbVersion: number, storeName: string, migration: (db: IDBDatabase, oldVersion: number, newVersion: number) => void) {
        this.dbKey = dbKey;
        this.dbVersion = dbVersion;
        this.storeName = storeName;
        this.migration = migration;
    }

    async open(): Promise<IDBDatabase> {
        if (this.internalDb) return this.internalDb
        const dbStore = this;
        return new Promise((callback, reject) => {
            const request = this.indexedDB.open(this.dbKey, this.dbVersion)
            request.onerror = function () {
                reject("Error: " + this.error);
            }
            request.onsuccess = function () {
                dbStore.internalDb = this.result;
                callback(this.result);
            }
            request.onupgradeneeded = function (event) {
                dbStore.migration(this.result, event.oldVersion, this.result.version)
            }
        })
    }

    async add(entry: T): Promise<void> {
        const db = await this.open();
        return new Promise((callback, reject) => {
            const transaction = db.transaction([this.storeName], "readwrite");
            transaction.onerror = function (e) {
                reject(e)
            }
            const store = transaction.objectStore(this.storeName)
            store.put(entry).onsuccess = function () {
                callback()
            }
        })
    }

    async remove(id: string): Promise<void> {
        const db = await this.open();
        return new Promise((callback, reject) => {
            const transaction = db.transaction([this.storeName], "readwrite");
            transaction.onerror = function (e) {
                reject(e)
            }
            const store = transaction.objectStore(this.storeName)
            store.delete(id).onsuccess = function () {
                callback()
            }
        })
    }

    async get(id: string): Promise<T> {
        const db = await this.open();
        return new Promise((callback, reject) => {
            const transaction = db.transaction([this.storeName], "readwrite");
            transaction.onerror = function (e) {
                reject(e)
            }
            const store = transaction.objectStore(this.storeName)
            store.get(id).onsuccess = function () {
                callback(this.result as T)
            }
        })
    }

    async getAllByIndex(index: string): Promise<T[]> {
        const db = await this.open();
        return new Promise((callback, reject) => {
            const transaction = db.transaction([this.storeName], "readwrite");
            transaction.onerror = function (e) {
                reject(e)
            }
            const store = transaction.objectStore(this.storeName)
            store.index(index).getAll().onsuccess = function () {
                callback(this.result.reverse() as T[])
            }
        })
    }

    async drop(): Promise<void> {
        const db = await this.open();
        return new Promise((callback, reject) => {
            const transaction = db.transaction([this.storeName], "readwrite");
            transaction.onerror = function (e) {
                reject(e)
            }
            transaction.objectStore(this.storeName).clear().onsuccess = function () {
                callback()
            }
        })
    }
}