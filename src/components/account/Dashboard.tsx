import React, { useContext } from 'react'
import { useParams } from 'react-router'
import Transactions from './transaction/Transactions';
import TransactionRepositoryProvider from '../provider/TransactionRepositoryProvider';
import QueueRepositoryProvider from '../provider/QueueRepositoryProvider';
import Queue from './queue/Queue';
import { Row } from '../../styled/tables';
import Apps from './apps/Apps';
import { Account, parseAccount } from '../../logic/utils/account';
import { useDektopLayout } from '../utils/media';
import { ResponsiveSidebar } from './ResponsiveSidebar';
import { Typography } from '@mui/material';
import AccountHeader from './header/AccountHeader';

interface Path {
    account: string
}

const AccountContext = React.createContext<Account | undefined>(undefined);

export const useAccount = () => {
    const account = useContext(AccountContext)
    if (!account) throw Error("Account not available!")
    return account
}

export const Dashboard: React.FC = () => {
    const { account } = useParams<Path>() //0x969c350577B6CD3A8E963cBB8D9c728B840c459e
    const isDesktop = useDektopLayout();
    const value = parseAccount(account)
    if (!value) return (<>
        "Invalid account"
    </>)
    return <AccountContext.Provider value={value}>
        <TransactionRepositoryProvider>
            <QueueRepositoryProvider>
                <Row>
                    <ResponsiveSidebar isDesktop={isDesktop} header={(expanded) => <AccountHeader expanded={expanded} />}>
                        <Queue />
                        <Transactions />
                    </ResponsiveSidebar>
                    <Apps />
                </Row>
            </QueueRepositoryProvider>
        </TransactionRepositoryProvider>
    </AccountContext.Provider>
}

export default Dashboard