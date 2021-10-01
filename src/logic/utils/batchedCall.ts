import { providers, Contract } from "ethers";

export interface BatchedCall {
    contract: Contract,
    method: string,
    params: Array<any>
}

export const batchedCall = async (provider: providers.Provider, calls: BatchedCall[]): Promise<any[]> => {
    return []
}