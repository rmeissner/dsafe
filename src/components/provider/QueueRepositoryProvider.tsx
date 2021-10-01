import React, { useContext, useEffect, useMemo } from "react";
import { QueueRepository } from "../../logic/account/QueueRepository";
import { useAccount } from "../account/Account";
import { useAppSettings } from "./AppSettingsProvider";


const QueueRepoContext = React.createContext<QueueRepository | undefined>(undefined);

export const useQueueRepo = () => {
    const repo = useContext(QueueRepoContext)
    if (!repo) throw Error("AccountInfoRepository not available!")
    return repo
}

export const QueueRepositoryProvider: React.FC = ({ children }) => {
    const account = useAccount()
    const { provider } = useAppSettings()

    const repo = useMemo(() => {
        return new QueueRepository(account, provider)
    }, [ account, provider ])

    return <QueueRepoContext.Provider value={repo}>
        { children }
    </QueueRepoContext.Provider>
}

export default QueueRepositoryProvider