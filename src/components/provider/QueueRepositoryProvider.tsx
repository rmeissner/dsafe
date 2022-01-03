import React, { useContext, useEffect, useMemo } from "react";
import { QueueRepository } from "../../logic/account/QueueRepository";
import { useAccount } from "../account/Dashboard";
import { useAppSettings } from "./AppSettingsProvider";
import { useFactoryRepo } from "./FactoryRepositoryProvider";


const QueueRepoContext = React.createContext<QueueRepository | undefined>(undefined);

export const useQueueRepo = () => {
    const repo = useContext(QueueRepoContext)
    if (!repo) throw Error("AccountInfoRepository not available!")
    return repo
}

export const QueueRepositoryProvider: React.FC = ({ children }) => {
    const account = useAccount()
    const factoryRepo = useFactoryRepo()
    const { loadProvider } = useAppSettings()

    const repo = useMemo(() => {
        const provider = loadProvider(account.chainId)
        return new QueueRepository(account, factoryRepo, provider)
    }, [ account, factoryRepo, loadProvider ])

    return <QueueRepoContext.Provider value={repo}>
        { children }
    </QueueRepoContext.Provider>
}

export default QueueRepositoryProvider