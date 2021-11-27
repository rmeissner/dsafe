import React, { useContext, useEffect, useMemo } from "react";
import { TransactionRepository as TransactionRepository } from "../../logic/account/TransactionRepository";
import { useAccount } from "../account/Dashboard";
import { useAppSettings } from "./AppSettingsProvider";


const TransactionRepoContext = React.createContext<TransactionRepository | undefined>(undefined);

export const useTransactionRepo = () => {
    const repo = useContext(TransactionRepoContext)
    if (!repo) throw Error("AccountInfoRepository not available!")
    return repo
}

export const TransactionRepositoryProvider: React.FC = ({ children }) => {
    const account = useAccount()
    const { loadProvider, networkConfig } = useAppSettings()

    const repo = useMemo(() => {
        return new TransactionRepository(account, networkConfig)
    }, [ account, networkConfig ])

    useEffect(() => {
        const provider = loadProvider(account.chainId)
        if (!provider) return
        return repo.connect(provider)
    }, [repo, loadProvider])

    useEffect(() => {
        return () => repo.disconnect()
    }, [repo])

    return <TransactionRepoContext.Provider value={repo}>
        { children }
    </TransactionRepoContext.Provider>
}

export default TransactionRepositoryProvider