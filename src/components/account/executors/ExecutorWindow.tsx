import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { CircularProgress, styled } from '@mui/material';
import { useAccount } from '../Dashboard';
import { useAppSettings } from '../../provider/AppSettingsProvider';
import { MetaTransaction } from '../../../logic/models/transactions';

const ExecutorFrame = styled('iframe')(({ theme }) => ({
  width: "100%",
  height: "150",
  border: 0
}))

export interface Props {
  tx: MetaTransaction
}

const ExecutorWindow: React.FC<Props> = ({ tx }) =>  {
  const account = useAccount()
  const { loadProvider } = useAppSettings()
  const [loading, setLoading] = useState<boolean>(false)
  const appFrame = useRef<HTMLIFrameElement>(null)
  const appUrl = "http://localhost:3001/"

  const onMessage = useMemo(() => {
    return (message: any) => {
        if (message.source === window) {
            return
        }
        if (typeof message.data !== "object") {
            return
        }
        const requestId = message.data.id
        const method = message.data.method
        console.log("#####", {method})
        if (method === "sapp_executionContext") {
            appFrame.current?.contentWindow?.postMessage({
                jsonrpc: "2.0",
                id: requestId,
                result: tx
            }, appUrl)
            return
        }
        appFrame.current?.contentWindow?.postMessage({
            jsonrpc: "2.0",
            id: requestId,
            error: {
                code: 42,
                message: "Unknown rpc call"
            } 
        }, appUrl)
    }
  }, [appFrame])

  useEffect(() => {
    const eventWindow = window
    if (!eventWindow) return
    const callback = (ev: MessageEvent<any>) => { onMessage(ev) }
    console.log("#####", {eventWindow})
    eventWindow.addEventListener('message', callback)
    return () => {
        try {
            eventWindow.removeEventListener('message', callback)
        } catch {}
    }
  }, [onMessage])

  if (loading) return (<CircularProgress />)
  return (
    <>
      <ExecutorFrame ref={appFrame} src={appUrl} />
    </>
  );
}

export default ExecutorWindow;
