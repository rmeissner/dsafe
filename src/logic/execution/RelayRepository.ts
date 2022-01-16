import axios from 'axios'
import { AccountInitializerDAO } from '../db/app'
import { Account } from '../utils/account'

export class RelayRepository {

    db: AccountInitializerDAO

    constructor(readonly relayUrl: string) {
        this.db = new AccountInitializerDAO()
    }

    connected(): boolean {
        return this.relayUrl.length > 0
    }

    async relayTransaction(account: Account, data: string) {
        const executor = account.address
        const chainId = account.chainId
        const storedInitializer = await this.db.get(account.id)
        const initializer = storedInitializer ? {
            to: storedInitializer.initializerTo,
            data: storedInitializer.initializerData
        } : undefined
        const resp = await axios.post(`${this.relayUrl}/relay`, {
            chainId,
            executor,
            data,
            initializer
        })
        return resp.data.id
    }
}