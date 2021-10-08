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
    const { provider, networkConfig } = useAppSettings()

    const repo = useMemo(() => {
        return new TransactionRepository(account, networkConfig)
    }, [ account, networkConfig ])

    useEffect(() => {
        if (!provider) return
        return repo.connect(provider)
    }, [provider])

    useEffect(() => {
        return () => repo.disconnect()
    }, [repo])

    return <TransactionRepoContext.Provider value={repo}>
        { children }
    </TransactionRepoContext.Provider>
}

export default TransactionRepositoryProvider