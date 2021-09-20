import { useCallback, useEffect, useMemo, useState } from 'react';
import { Callback, SafeInteraction } from 'safe-indexer-ts';
import { Button, styled } from '@mui/material';
import { InteractionsDB } from '../../logic/db/interactions';
import { getIndexer } from '../../logic/utils/indexer';
import { IndexerState } from '../../logic/state/indexer';
import { useHistory, useRouteMatch } from 'react-router';
import { useAccount } from './Account';
import { useAppSettings } from '../provider/AppSettingsProvider';
import SettingsDialog from '../settings/SettingsDialog';
import TxDetails from './transaction/TxDetails';
import TxSummary from './transaction/TxSummary';

const Root = styled('div')(({ theme }) => ({
  textAlign: "center"
}))

function Transactions() {
  const match = useRouteMatch()
  const history = useHistory()
  const { provider, networkConfig } = useAppSettings()
  const account = useAccount()
  const callbackProxy = useMemo<{ current?: Callback }>(() => { return {} }, [])
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [txs, setTxs] = useState<SafeInteraction[]>([])
  const [status, setStatus] = useState<string>("")
  const [showSettings, setShowSettings] = useState<boolean>(false)

  useEffect(() => {
    callbackProxy.current = {
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
    return () => callbackProxy.current = undefined
  }, [callbackProxy, txs, setTxs, setStatus])

  useEffect(() => {
    // Reset id if account changes
    setSelectedId(undefined)
  }, [account])

  const db = useMemo(() => { 
    return new InteractionsDB(account.id) 
  }, [account])

  const showDetails = useCallback(async (id, index) => {
    setSelectedIndex(index)
    setSelectedId(id)
  }, [setSelectedId])

  const indexer = useMemo(() => {
    if (!provider) return
    if (!account || account.address.trim().length == 0) return
    const callback: Callback = {
      onNewInteractions: (interactions) => {
        callbackProxy?.current?.onNewInteractions(interactions)
        interactions.forEach((interaction) => { db.add(interaction) })
      },
      onStatusUpdate: (update) => {
        callbackProxy?.current?.onStatusUpdate?.(update)
      }
    }
    const indexer = getIndexer(account, provider, networkConfig, callback)
    return indexer
  }, [callbackProxy, account, provider, db, networkConfig])

  useEffect(() => {
    indexer?.start().catch((e: any) => console.error(e))
    return () => indexer?.stop()
  }, [indexer])

  const reindex = useCallback(async () => {
    if (!indexer) return;
    indexer.pause();
    await db.drop();
    (indexer.state as IndexerState).reset();
    db.getAll().then((loaded) => setTxs(loaded))
    indexer.resume();
    setStatus("Waiting for reindexing")
  }, [indexer, db, setStatus])

  useEffect(() => {
    setTxs([])
    db.getAll().then((loaded) => setTxs(loaded))
  }, [db, setTxs])

  const details = useMemo(() => {
    return <TxDetails id={selectedId} handleClose={() => setSelectedId(undefined)} />
  }, [selectedId, setSelectedId])

  return (
    <Root>
      <>
        {status}
        <Button onClick={() => setShowSettings(true)}>Settings</Button>
      </>
      {txs.map((e, index) => <TxSummary interaction={e} showDetails={(id) => showDetails(id, index)} />)}
      <SettingsDialog open={showSettings} handleClose={() => setShowSettings(false)} reindex={reindex} />
      {details}
    </Root>
  );
}

export default Transactions;
