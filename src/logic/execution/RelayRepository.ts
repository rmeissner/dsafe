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
        const initializer = await this.db.get(account.id)
        const resp = await axios.post(`${this.relayUrl}/relay`, {
            chainId,
            executor,
            data,
            initializer: {
                to: initializer?.initializerTo,
                data: initializer?.initializerData
            }
        })
        return resp.data.id
    }
}