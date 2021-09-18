import { ethers, providers } from "ethers";
import React, { useContext, useMemo, useState } from "react";

declare let window: any;

export interface AppSettings {
    readonly customRpc: string,
    readonly useCustomRpc: boolean,
    readonly provider: providers.Provider | undefined,
    toggleCustomRpc: (value: boolean) => void
    updateCustomRpc: (value: string) => void
}

const AppSettingsContext = React.createContext<AppSettings | undefined>(undefined);

export const useAppSettings = () => {
    const appSettings = useContext(AppSettingsContext)
    if (!appSettings) throw Error("App Settings not available!")
    return appSettings
}

export const AppSettingsProvider: React.FC = ({children}) => {
    const [useCustomRpc, setUseCustomRpc] = useState(localStorage.getItem("app_state_use_rpc") === "true")
    const [customRpc, setCustomRpc] = useState(localStorage.getItem("app_state_rpc") || "")
    const toggleCustomRpc = (value: boolean) => {
        localStorage.setItem("app_state_use_rpc", value ? "true" : "false")
        setUseCustomRpc(value)
    } 
    const updateCustomRpc = (value: string) => {
        localStorage.setItem("app_state_rpc", value)
        setCustomRpc(value)
    } 
    const provider = useMemo(() => { 
        if (useCustomRpc) {
            if (!customRpc) return undefined
            return new ethers.providers.JsonRpcProvider(customRpc); // "https://bsc-dataseed1.ninicoin.io" 
        }
        if (window.ethereum) {
            return new ethers.providers.Web3Provider(window.ethereum)
        }
        return undefined
    }, [useCustomRpc, customRpc])
    return <AppSettingsContext.Provider value={{ customRpc, useCustomRpc, provider, toggleCustomRpc, updateCustomRpc }}>
        {children}
    </AppSettingsContext.Provider>
}

export default AppSettingsProvider