import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, styled } from '@mui/material';
import { QueuedSafeTransaction } from '../../logic/db/interactions';
import CreateTx from './queue/CreateTxDialog';
import { useQueueRepo } from '../provider/QueueRepositoryProvider';
import QueuedTxSummary from './queue/QueuedTxSummary';
import QueuedTxDetails from './queue/QueuedTxDetails';
import { useTransactionRepo } from '../provider/TransactionRepositoryProvider';
import { Callback } from 'safe-indexer-ts';

const Root = styled('div')(({ theme }) => ({
  textAlign: "center"
}))

function Queue() {
  const [showNewTxDialog, setShowNewTxDialog] = useState<boolean>(false)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [ququedTxs, setQueuedTxs] = useState<QueuedSafeTransaction[]>([])
  const queueRepo = useQueueRepo()
  const txRepo = useTransactionRepo()

  const loadQueuedTxs = useCallback(async () => {
    try {
      setQueuedTxs(await queueRepo.getQueuedTxs())
    } catch (e) {
      console.error(e)
    }
  }, [queueRepo, setQueuedTxs])

  useEffect(() => {
    const callback: Callback = {
      onNewInteractions: loadQueuedTxs
    }
    txRepo.registerCallback(callback)
    return () => txRepo.unregisterCallback(callback)
  }, [txRepo, loadQueuedTxs])

  useEffect(() => {
    loadQueuedTxs()
  }, [loadQueuedTxs])

  const creation = useMemo(() => {
    return <CreateTx open={showNewTxDialog} handleClose={() => setShowNewTxDialog(false)} handleTx={() => loadQueuedTxs() } />
  }, [showNewTxDialog, setShowNewTxDialog])

  const details = useMemo(() => {
    return <QueuedTxDetails id={selectedId} handleClose={() => setSelectedId(undefined)} />
  }, [selectedId, setSelectedId])

  return (
    <Root>
      <Button onClick={() => setShowNewTxDialog(true)}>Add</Button>
      {ququedTxs.map((tx) => <QueuedTxSummary transaction={tx} showDetails={(id) => setSelectedId(id)} />)}
      {creation}
      {details}
    </Root>
  );
}

export default Queue;
