import { useMediaQuery } from "@mui/material";
import { buildCaip2Addr } from "../../logic/utils/account";
import { useAccount } from "../account/Dashboard";

export const useDektopLayout = (): boolean => useMediaQuery('(min-width:600px)');

export const copyToClipboard = (text: string, copyMessage?: string) => {
    try {
        navigator.clipboard.writeText(text)
        if (copyMessage) {
            window.alert(copyMessage)
        }
    }  catch (e) {
        console.log(e)
    }
}

export const useCopyAddress = (address: string): (() => void) => {
    const account = useAccount()
    const shareableText = buildCaip2Addr(account.chainId, address)
    return () => { copyToClipboard(shareableText, "Copied address to clipboard!") }
}