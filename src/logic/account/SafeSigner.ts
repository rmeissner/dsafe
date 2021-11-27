import Onboard from 'bnc-onboard'
import { API, WalletInitOptions } from "bnc-onboard/dist/src/interfaces";
import { findChainRpc } from '../utils/chainInfo';

export interface SignerInfo {
    signerAddress?: string
}

export class SafeSigner {

    private onboard?: API
    private rpcProvider?: (networkId: number) => string | undefined
    private providerChangeListener?: (provider: any | null) => void

    onProviderChange(listener?: (provider: any) => void) {
        this.providerChangeListener = listener
    }

    setRpcProvider(rpcProvider: ((networkId: number) => string | undefined) | undefined) {
        this.rpcProvider = rpcProvider
    }

    async prepare(networkId: number, showSelection?: boolean): Promise<boolean> {
        this.clear()
        const wallets: WalletInitOptions[] = [
            { walletName: "metamask" },
        ]
        const rpc = this.rpcProvider?.(networkId)
        if (rpc) {
            wallets.push(
                {
                    walletName: 'walletConnect',
                    rpc: {
                        [networkId.toString()]: rpc
                    },
                    bridge: 'https://safe-walletconnect.gnosis.io/',
                },
                {
                  walletName: 'ledger',
                  rpcUrl: rpc
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
            return {
                signerAddress: state?.address
            }
        } catch (e) {
            return {}
        }
    }
}