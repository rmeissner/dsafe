export const defaultApps: AppOption[] = [
    {
        title: "Balances",
        url: "https://rimeissner.dev/sapp-balances/"
    },
    {
        title: "WalletConnect",
        url: "https://apps.gnosis-safe.io/wallet-connect"
    },
    {
        title: "ENS",
        url: "https://app.ens.domains/"
    }
].map((entry) => {return {
    section: "Default",
    ...entry
}})

export interface AppOption {
    section: string,
    title: string,
    url: string
}