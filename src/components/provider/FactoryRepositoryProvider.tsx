import React, { useContext, useMemo } from "react";
import { FactoryRepository } from "../../logic/execution/FactoryRepository";


const FactoryRepoContext = React.createContext<FactoryRepository | undefined>(undefined);

export const useFactoryRepo = () => {
    const repo = useContext(FactoryRepoContext)
    if (!repo) throw Error("FactoryRepository not available!")
    return repo
}

export const FactoryRepositoryProvider: React.FC = ({ children }) => {

    const repo = useMemo(() => {
        return new FactoryRepository()
    }, [])

    return <FactoryRepoContext.Provider value={repo}>
        { children }
    </FactoryRepoContext.Provider>
}

export default FactoryRepositoryProvider