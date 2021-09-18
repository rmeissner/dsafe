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
  const { address: account } = useAccount()
  const callbackProxy = useMemo<{ current?: Callback }>(() => { return {} }, [])
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [txs, setTxs] = useState<SafeInteraction[]>([])
  const [showSettings, setShowSettings] = useState<boolean>(false)

  useEffect(() => {
    callbackProxy.current = {
      onNewInteractions: (newTxs) => {
        setTxs(newTxs.concat(txs))
      }
    }
    return () => callbackProxy.current = undefined
  }, [callbackProxy, txs, setTxs])

  useEffect(() => {
    // Reset id if account changes
    setSelectedId(undefined)
  }, [account])

  const db = useMemo(() => { return new InteractionsDB(account) }, [account])

  const showDetails = useCallback(async (id) => {
    setSelectedId(id)
  }, [setSelectedId])

  const indexer = useMemo(() => {
    if (!provider) return
    if (!account || account.trim().length == 0) return
    const indexer = getIndexer(account, provider, networkConfig, (e) => {
      console.log(e)
      callbackProxy?.current?.onNewInteractions(e)
      e.forEach((i) => {
        db.add(i)
      })
    })
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
  }, [indexer, db])

  useEffect(() => {
    setTxs([])
    db.getAll().then((loaded) => setTxs(loaded))
  }, [db, setTxs])

  return (
    <Root>
      <Button onClick={() => setShowSettings(true)}>Settings</Button>
      {txs.map((e) => <TxSummary interaction={e} showDetails={showDetails} />)}
      <SettingsDialog open={showSettings} handleClose={() => setShowSettings(false)} reindex={reindex} />
      <TxDetails id={selectedId} handleClose={() => setSelectedId(undefined)} />
    </Root>
  );
}

export default Transactions;
