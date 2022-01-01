import axios from 'axios'

export class RelayRepository {

    constructor(readonly relayUrl: string) {
    }

    connected(): boolean {
        return this.relayUrl.length > 0
    }

    async relayTransaction(chainId: number, safe: string, data: string) {
        const resp = await axios.post(this.relayUrl, {
            chainId,
            executor: safe,
            data
        })
        return resp.data.id
    }
}