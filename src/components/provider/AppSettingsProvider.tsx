import { ethers, providers, Signer } from "ethers";
import { TypedDataSigner } from "@ethersproject/abstract-signer"
import React, { useContext, useEffect, useMemo, useState } from "react";
import Onboard from 'bnc-onboard'
import chains from '../../logic/utils/chains.json'
import { API, Wallet, WalletInitOptions, WalletModule } from "bnc-onboard/dist/src/interfaces";

declare let window: any;

export interface NetworkConfig {
    maxBlocks: number,
    startingBlock: number
}

const defaultConfig: NetworkConfig = {
    startingBlock: -1,
    maxBlocks: 1000
}

export interface SignerInfo {
    signerAddress?: string
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

const findRpc = (networkId: number): string | undefined => {
    console.log("#####", {chains})
    const chain = chains.find(
        (chain) => { 
            return chain.chainId === networkId
        }
    )
    console.log("#####", {chain})
    return chain?.rpc?.find(
        (rpc) => {
            console.log("#####", {rpc}, !rpc.startsWith("ws") && !rpc.includes("INFURA_API_KEY"))
            return !rpc.startsWith("ws") && !rpc.includes("INFURA_API_KEY")
        }
    )
}

export class SafeSigner {

    private onboard?: API
    private providerChangeListener?: (provider: any | null) => void

    onProviderChange(listener?: (provider: any) => void) {
        this.providerChangeListener = listener
    }

    async prepare(networkId: number, showSelection?: boolean): Promise<boolean> {
        this.clear()
        const wallets: WalletInitOptions[] = [
            { walletName: "metamask" },
        ]
        const rpc = findRpc(networkId)
        if (rpc) {
            wallets.push(
                {
                    walletName: 'walletConnect',
                    rpc: {
                        [networkId.toString()]: rpc
                    },
                    bridge: 'https://safe-walletconnect.gnosis.io/',
                }
            )
        }
        const onboard = Onboard({
            networkId,
            subscriptions: {
                wallet: wallet => {
                    if (wallet.name) localStorage.setItem("last_selected_wallet_name", wallet.name)
                    try {
                        this.providerChangeListener?.(wallet.provider)
                    } catch (e) {
                        console.error(e)
                    }
                },
                address: address => {
                    console.log({ address })
                }
            },
            walletSelect: {
                description: 'Please select a Signer',
                wallets
            },
            walletCheck: [
                { checkName: 'derivationPath' },
                { checkName: 'connect' },
                { checkName: 'accounts' },
                { checkName: 'network' }
            ],
        })
        this.onboard = onboard
        const lastSelectedWallet = localStorage.getItem("last_selected_wallet_name") || undefined
        if (!lastSelectedWallet && showSelection != true) return false
        if (await onboard.walletSelect(lastSelectedWallet))
            return await onboard.walletCheck();
        return false
    }

    async connect(networkId: number): Promise<boolean> {
        return this.prepare(networkId, true)
    }

    async disconnect(): Promise<void> {
        localStorage.removeItem("last_selected_wallet_name")
        this.clear()
    }

    async clear() {
        this.onboard?.walletReset()
        this.onboard = undefined
    }

    status(): SignerInfo {
        try {
            const state = this.onboard?.getState()
            console.log(state)
            return {
                signerAddress: state?.address
            }
        } catch (e) {
            return {}
        }
    }
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
            return new ethers.providers.JsonRpcProvider(customRpc); // "https://bsc-dataseed1.ninicoin.io" 
        }
        if (connectedProvider) {
            return new ethers.providers.Web3Provider(connectedProvider)
        }
        return undefined
    }, [useCustomRpc, customRpc, connectedProvider])

    const safeSigner = useMemo(() => {
        return new SafeSigner();
    }, [])

    useEffect(() => {
        safeSigner.onProviderChange(setConnectedProvider)
    }, [setConnectedProvider])

    return <AppSettingsContext.Provider value={{ customRpc, useCustomRpc, provider, signer: provider?.getSigner(), networkConfig, toggleCustomRpc, updateCustomRpc, updateNetworkConfig, safeSigner }}>
        {children}
    </AppSettingsContext.Provider>
}

export default AppSettingsProvider