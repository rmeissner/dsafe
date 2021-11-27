import { ethers, providers, Signer } from "ethers";
import { TypedDataSigner } from "@ethersproject/abstract-signer"
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SafeSigner } from "../../logic/account/SafeSigner";
import { findChainRpc } from "../../logic/utils/chainInfo";

export interface NetworkConfig {
    maxBlocks: number,
    startingBlock: number
}

const defaultConfig: NetworkConfig = {
    startingBlock: -1,
    maxBlocks: 1000
}

export interface AppSettings {
    readonly infuraToken: string,
    readonly customRpc: string,
    readonly useCustomRpc: boolean,
    readonly signer: Signer & TypedDataSigner | undefined,
    readonly safeSigner: SafeSigner,
    readonly networkConfig: NetworkConfig,
    loadProvider: (networkId: number) => providers.JsonRpcProvider | undefined,
    toggleCustomRpc: (value: boolean) => void
    updateCustomRpc: (value: string) => void
    updateInfuraToken: (value: string) => void
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
    const [infuraToken, setInfuraToken] = useState(localStorage.getItem("app_state_infura_token") || "")
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
    const updateInfuraToken = (value: string) => {
        localStorage.setItem("app_state_infura_token", value)
        setInfuraToken(value)
    }
    const updateNetworkConfig = (value: NetworkConfig) => {
        const serialized = JSON.stringify({
            maxBlocks: value.maxBlocks || 100,
            startingBlock: value.startingBlock || -1
        })
        localStorage.setItem("app_state_network_config", serialized)
        setNetworkConfig(value)
    }

    const getChainRpc = useCallback((networkId: number): string | undefined => {
        if (infuraToken) {
            const rpcUrl = findChainRpc(networkId, true)
            return rpcUrl?.replaceAll("${INFURA_API_KEY}", infuraToken);
        }
        return findChainRpc(networkId, false)
    }, [infuraToken])

    const loadProvider = useCallback((networkId: number): providers.JsonRpcProvider | undefined => {
        if (useCustomRpc) {
            if (!customRpc) return undefined
            return new ethers.providers.JsonRpcProvider(customRpc);
        }
        if (connectedProvider) {
            return new ethers.providers.Web3Provider(connectedProvider)
        }
        const chainRpc = getChainRpc(networkId)
        if (chainRpc) {
            return new ethers.providers.JsonRpcProvider(chainRpc);
        }
        return undefined
    }, [getChainRpc, useCustomRpc, connectedProvider])

    const signer = useMemo(() => {
        if (connectedProvider) {
            return new ethers.providers.Web3Provider(connectedProvider).getSigner()
        }
        return undefined;
    }, [connectedProvider])

    // TODO refactor all safeSigner hooks into separate file
    const safeSigner = useMemo(() => {
        return new SafeSigner();
    }, [])

    useEffect(() => {
        safeSigner.setRpcProvider(getChainRpc)
    }, [safeSigner, getChainRpc])

    useEffect(() => {
        safeSigner.onProviderChange(setConnectedProvider)
    }, [safeSigner, setConnectedProvider])

    return <AppSettingsContext.Provider value={{
        customRpc, useCustomRpc, infuraToken, signer, networkConfig,
        loadProvider, toggleCustomRpc, updateCustomRpc, updateInfuraToken, updateNetworkConfig,
        safeSigner
    }}>
        {children}
    </AppSettingsContext.Provider>
}

export default AppSettingsProvider