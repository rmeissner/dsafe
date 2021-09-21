import { useCallback, useEffect, useMemo, useState } from 'react';
import { Callback, SafeInteraction } from 'safe-indexer-ts';
import { Button, styled } from '@mui/material';
import { useAccount } from './Account';
import SettingsDialog from '../settings/SettingsDialog';
import TxDetails from './transaction/TxDetails';
import TxSummary from './transaction/TxSummary';
import { useTransactionRepo } from '../provider/TransactionRepositoryProvider';

const Root = styled('div')(({ theme }) => ({
  textAlign: "center"
}))

function Transactions() {
  const account = useAccount()
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [txs, setTxs] = useState<SafeInteraction[]>([])
  const [status, setStatus] = useState<string>("")
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const accountRepo = useTransactionRepo()

  useEffect(() => {
    const callback: Callback = {
      onNewInteractions: (newTxs) => {
        setTxs(newTxs.concat(txs))
      },
      onStatusUpdate: (update) => {
        switch (update.type) {
          case "up_to_date":
            setStatus(`Up to date with block ${update.latestBlock}`)
            break;  
          case "processing":
            setStatus(`Indexing block ${update.fromBlock}/${update.latestBlock}`)
            break;
          case "aborted":
            setStatus(`Indexing aborted: ${update.reason}`)
            break;
          default:
            setStatus("")
            break;
        }
      }
    }
    accountRepo.registerCallback(callback)
    return () => accountRepo.unregisterCallback(callback)
  }, [accountRepo, txs, setTxs, setStatus])

  useEffect(() => {
    // Reset id if account changes
    setSelectedId(undefined)
  }, [account])

  const showDetails = useCallback(async (id) => {
    setSelectedId(id)
  }, [setSelectedId])

  const reindex = useCallback(async () => {
    if (await accountRepo.reindex()) {
      accountRepo.getAllTxs().then((loaded) => setTxs(loaded))
      setStatus("Waiting for reindexing")
    }
  }, [accountRepo, setStatus])

  useEffect(() => {
    setTxs([])
    accountRepo.getAllTxs().then((loaded) => setTxs(loaded))
  }, [accountRepo, setTxs])

  const details = useMemo(() => {
    return <TxDetails id={selectedId} handleClose={() => setSelectedId(undefined)} />
  }, [selectedId, setSelectedId])

  return (
    <Root>
      <>
        {status}
        <Button onClick={() => setShowSettings(true)}>Settings</Button>
      </>
      {txs.map((e) => <TxSummary interaction={e} showDetails={(id) => showDetails(id)} />)}
      <SettingsDialog open={showSettings} handleClose={() => setShowSettings(false)} reindex={reindex} />
      {details}
    </Root>
  );
}

export default Transactions;
