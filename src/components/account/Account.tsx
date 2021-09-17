import React, { createContext, useContext } from 'react'
import { useParams } from 'react-router'
import Transactions from './Transactions';

interface Path {
    account: string
}

export interface Account {
    address: string
}

const AccountContext = React.createContext<Account | undefined>(undefined);

export const useAccount = () => {
    const account = useContext(AccountContext)
    if (!account) throw Error("Account not available!")
    return account
}

export const Account: React.FC = () => {
    const { account } = useParams<Path>() //0x969c350577B6CD3A8E963cBB8D9c728B840c459e
    return <AccountContext.Provider value={{ address: account }}>
        <Transactions />
    </AccountContext.Provider>
}

export default Account