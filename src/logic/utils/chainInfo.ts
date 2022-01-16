import chains from '../../logic/utils/chains.json'

export interface ChainInfo {
    name: string,
    id: number
}

export const findChainRpc = (networkId: number, includeInfura: boolean): string | undefined => {
    const chain = chains.find(
        (chain) => {
            return chain.chainId === networkId
        }
    )
    return chain?.rpc?.find(
        (rpc) => {
            return !rpc.startsWith("ws") && (includeInfura || !rpc.includes("INFURA_API_KEY"))
        }
    )
}

export const loadChains = (): ChainInfo[] => {
    return chains.map(chain => {
        return {
            id: chain.chainId,
            name: chain.name
        }
    })
}