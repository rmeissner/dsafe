import React, { useContext } from 'react'
import { useParams } from 'react-router'
import Transactions from './Transactions';
import shortNames from '../../logic/utils/shotNameToChainId.json'
import { networkInterfaces } from 'os';
import { ethers } from 'ethers';

interface Path {
    account: string
}

export interface Account {
    id: string
    chainId: number
    address: string
}

const AccountContext = React.createContext<Account | undefined>(undefined);

export const useAccount = () => {
    const account = useContext(AccountContext)
    if (!account) throw Error("Account not available!")
    return account
}

const buildCaip2Addr = (chainId: number, address: string) => {
    return `eip155:${chainId}:${address}`
}

const shortNameToChainId = (shortName: string): string | undefined => {
    return (shortNames as Record<string, string>)[shortName]
}

const parseAddress = (address: string): string | undefined => {
    try {
        return ethers.utils.getAddress(address) 
    } catch {
        return undefined
    }
 }

 const parseChainId = (chainId: string): number | undefined => {
     try {
         return parseInt(chainId)
     } catch {
         return undefined
     }
  }

const parseAccount = (account: string): Account | undefined => {
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

export const Account: React.FC = () => {
    const { account } = useParams<Path>() //0x969c350577B6CD3A8E963cBB8D9c728B840c459e
    const value = parseAccount(account)
    return <AccountContext.Provider value={value}>
        { value ? <Transactions /> : ("Invalid account") }
    </AccountContext.Provider>
}

export default Account