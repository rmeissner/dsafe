import React, { useContext, useState } from "react";

export interface AppSettings {
    readonly rpc: string,
    updateRpc: (value: string) => void
}

const AppSettingsContext = React.createContext<AppSettings | undefined>(undefined);

export const useAppSettings = () => {
    const appSettings = useContext(AppSettingsContext)
    if (!appSettings) throw Error("App Settings not available!")
    return appSettings
}

export const AppSettingsProvider: React.FC = ({children}) => {
    const [rpc, setRpc] = useState(localStorage.getItem("app_state_rpc") || "")
    const updateRpc = (value: string) => {
        localStorage.setItem("app_state_rpc", value)
        setRpc(value)
    } 
    return <AppSettingsContext.Provider value={{ rpc, updateRpc }}>
        {children}
    </AppSettingsContext.Provider>
}

export default AppSettingsProvider