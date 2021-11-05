import { ethers } from 'ethers'
import shortNames from './shortNameToChainId.json'

export interface Account {
    id: string
    chainId: number
    address: string
}

export const buildCaip2Addr = (chainId: number, address: string) => {
    return `eip155:${chainId}:${address}`
}

export const shortNameToChainId = (shortName: string): string | undefined => {
    return (shortNames as Record<string, string>)[shortName]
}

export const parseAddress = (address: string): string | undefined => {
    try {
        return ethers.utils.getAddress(address)
    } catch {
        return undefined
    }
}

export const parseChainId = (chainId: string): number | undefined => {
    try {
        return parseInt(chainId)
    } catch {
        return undefined
    }
}

export const parseAccount = (account: string): Account | undefined => {
    const accountParts = account.split(":")
    let network = undefined
    let address = undefined
    if (accountParts.length == 1) {
        address = parseAddress(accountParts[0])
        network = "eip155:1"
    } else if (accountParts.length == 2) {
        address = parseAddress(accountParts[1])
        network = shortNameToChainId(accountParts[0])
    } else if (accountParts.length == 3) {
        address = parseAddress(accountParts[2])
        network = `${accountParts[0]}:${accountParts[1]}`
    }

    if (!network || !address) return undefined
    const networkParts = network.split(":")
    if (networkParts.length != 2 || networkParts[0] !== "eip155") return undefined
    const chainId = parseChainId(networkParts[1])
    if (!chainId) return undefined
    return {
        address,
        chainId: chainId,
        id: buildCaip2Addr(chainId, address)
    }
}