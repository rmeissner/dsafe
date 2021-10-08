import { ethers, providers, Signer } from "ethers";
import { TypedDataSigner } from "@ethersproject/abstract-signer"
import React, { useContext, useMemo, useState } from "react";

declare let window: any;

export interface NetworkConfig {
    maxBlocks: number,
    startingBlock: number
}

const defaultConfig: NetworkConfig = {
    startingBlock: -1,
    maxBlocks: 1000
}

export interface AppSettings {
    readonly customRpc: string,
    readonly useCustomRpc: boolean,
    readonly provider: providers.JsonRpcProvider | undefined,
    readonly signer: Signer & TypedDataSigner | undefined,
    readonly networkConfig: NetworkConfig,
    toggleCustomRpc: (value: boolean) => void
    updateCustomRpc: (value: string) => void
    updateNetworkConfig: (value: NetworkConfig) => void
    enable: () => Promise<string[]>
}

const AppSettingsContext = React.createContext<AppSettings | undefined>(undefined);

export const useAppSettings = () => {
    const appSettings = useContext(AppSettingsContext)
    if (!appSettings) throw Error("App Settings not available!")
    return appSettings
}

export const AppSettingsProvider: React.FC = ({ children }) => {
    const [useCustomRpc, setUseCustomRpc] = useState(localStorage.getItem("app_state_use_rpc") === "true")
    const [customRpc, setCustomRpc] = useState(localStorage.getItem("app_state_rpc") || "")
    const storedConfig = localStorage.getItem("app_state_network_config")
    const [networkConfig, setNetworkConfig] = useState<NetworkConfig>(storedConfig ? JSON.parse(storedConfig) : defaultConfig)
    const toggleCustomRpc = (value: boolean) => {
        localStorage.setItem("app_state_use_rpc", value ? "true" : "false")
        setUseCustomRpc(value)
    }
    const updateCustomRpc = (value: string) => {
        localStorage.setItem("app_state_rpc", value)
        setCustomRpc(value)
    }
    const updateNetworkConfig = (value: NetworkConfig) => {
        const serialized = JSON.stringify({
            maxBlocks: value.maxBlocks || 100,
            startingBlock: value.startingBlock || -1
        })
        localStorage.setItem("app_state_network_config", serialized)
        setNetworkConfig(value)
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
    const enable = async (): Promise<string[]> => {
        if (window.ethereum) {
            return window.ethereum.enable()
        }
        return []
    }
    return <AppSettingsContext.Provider value={{ customRpc, useCustomRpc, provider, signer: provider?.getSigner(), networkConfig, toggleCustomRpc, updateCustomRpc, updateNetworkConfig, enable }}>
        {children}
    </AppSettingsContext.Provider>
}

export default AppSettingsProvider