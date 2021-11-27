import chains from '../../logic/utils/chains.json'

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