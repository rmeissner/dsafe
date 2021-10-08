import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { CircularProgress, styled } from '@mui/material';
import { FrameCommunicator } from '../../../logic/apps/connector';
import {
  RequestId,
  BaseTransaction
} from '@gnosis.pm/safe-apps-sdk'
import { useAccount } from '../Dashboard';
import { useAppSettings } from '../../provider/AppSettingsProvider';
import ProposeTxs from './ProposeTxsDialog';
import { QueuedSafeTransaction } from '../../../logic/db/interactions';

const Root = styled('div')(({ theme }) => ({
  textAlign: "center",
  width: "100vw",
  height: "100vh"
}))

const AppFrame = styled('iframe')(({ theme }) => ({
  width: "100%",
  height: "100%",
  border: 0
}))

interface ProposalParams {
    transactions: BaseTransaction[]
    requestId: RequestId
}

function Apps() {
  const account = useAccount()
  const { provider } = useAppSettings()
  const [loading, setLoading] = useState<boolean>(false)
  const [proposalParams, setProposalParams] = useState<ProposalParams | undefined>(undefined)
  const appUrl = "https://apps.gnosis-safe.io/wallet-connect"
  const appFrame = useRef<HTMLIFrameElement>(null)
  const communicator: FrameCommunicator = useMemo(() => {
    return new FrameCommunicator(appFrame, appUrl, account, {
      onTransactionProposal: (transactions, requestId) => {
        if (transactions.length == 0) return
        if (document.hidden) {
          window.alert("New transaction")
        }
        setProposalParams({ transactions, requestId })
      }
    })
  }, [account, appFrame, appUrl, setProposalParams])

  useEffect(() => {
    communicator.provider = provider
  }, [communicator, provider])

  const handleTransactionConfirmation = useCallback(async (tx: QueuedSafeTransaction, requestId?: string) => {
    console.log("handleTransactionConfirmation", tx, requestId)
    communicator.sendResponse({ safeTxHash: tx.id }, requestId || "")
  }, [communicator, setProposalParams])

  const handleTransactionRejection = useCallback(async (message: string, requestId?: string) => {
    console.log("handleTransactionRejection", message, requestId)
    communicator.sendError(message, requestId || "")
  }, [communicator, setProposalParams])

  useEffect(() => {
    return communicator.connect(window)
  }, [communicator])

  const creation = useMemo(() => {
    return <ProposeTxs open={!!proposalParams}
      transactions={proposalParams?.transactions?.map((tx) => {
        return {
          ...tx,
          operation: 0
        }
      })}
      requestId={proposalParams?.requestId}
      onReject={handleTransactionRejection}
      onConfirm={handleTransactionConfirmation}
      handleClose={() => setProposalParams(undefined) } />
  }, [proposalParams, handleTransactionRejection, handleTransactionConfirmation])

  if (loading) return (<CircularProgress />)
  return (
    <Root>
      <AppFrame ref={appFrame} src={appUrl} />
      {creation}
    </Root>
  );
}

export default Apps;
