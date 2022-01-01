import React, { useContext, useEffect, useMemo } from "react";
import { RelayRepository } from "../../logic/execution/RelayRepository";
import { useAccount } from "../account/Dashboard";
import { useAppSettings } from "./AppSettingsProvider";


const RelayRepoContext = React.createContext<RelayRepository | undefined>(undefined);

export const useRelayRepo = () => {
    const repo = useContext(RelayRepoContext)
    if (!repo) throw Error("AccountInfoRepository not available!")
    return repo
}

export const RelayRepositoryProvider: React.FC = ({ children }) => {
    const { relayService } = useAppSettings()

    const repo = useMemo(() => {
        return new RelayRepository(relayService)
    }, [ relayService ])

    return <RelayRepoContext.Provider value={repo}>
        { children }
    </RelayRepoContext.Provider>
}

export default RelayRepositoryProvider