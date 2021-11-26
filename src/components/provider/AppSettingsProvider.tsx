import { ethers, providers, Signer } from "ethers";
import { TypedDataSigner } from "@ethersproject/abstract-signer"
import React, { useContext, useEffect, useMemo, useState } from "react";
import { SafeSigner } from "../../logic/account/SafeSigner";

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
    readonly safeSigner: SafeSigner,
    readonly networkConfig: NetworkConfig,
    toggleCustomRpc: (value: boolean) => void
    updateCustomRpc: (value: string) => void
    updateNetworkConfig: (value: NetworkConfig) => void
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
    const [connectedProvider, setConnectedProvider] = useState<any | null>(undefined)
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
            return new ethers.providers.JsonRpcProvider(customRpc); 
        }
        if (connectedProvider) {
            return new ethers.providers.Web3Provider(connectedProvider)
        }
        return undefined
    }, [useCustomRpc, customRpc, connectedProvider])

    const signer = useMemo(() => {
        let signerProvider = provider
        if (useCustomRpc && connectedProvider) {
            signerProvider = new ethers.providers.Web3Provider(connectedProvider)
        }
        return signerProvider?.getSigner()
    }, [provider])

    const safeSigner = useMemo(() => {
        return new SafeSigner();
    }, [])

    useEffect(() => {
        safeSigner.onProviderChange(setConnectedProvider)
    }, [safeSigner, setConnectedProvider])

    return <AppSettingsContext.Provider value={{ customRpc, useCustomRpc, provider, signer, networkConfig, toggleCustomRpc, updateCustomRpc, updateNetworkConfig, safeSigner }}>
        {children}
    </AppSettingsContext.Provider>
}

export default AppSettingsProvider