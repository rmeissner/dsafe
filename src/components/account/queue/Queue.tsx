import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, styled } from '@mui/material';
import { QueuedSafeTransaction } from '../../../logic/db/interactions';
import { useQueueRepo } from '../../provider/QueueRepositoryProvider';
import QueuedTxSummary from './QueuedTxSummary';
import QueuedTxDetails from './QueuedTxDetails';
import { useTransactionRepo } from '../../provider/TransactionRepositoryProvider';
import { Callback } from 'safe-indexer-ts';
import { QueueRepositoryUpdates } from '../../../logic/account/QueueRepository';
import ProposeTxs from './ProposeTxsDialog';

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
    const callback: QueueRepositoryUpdates = {
      onNewTx: loadQueuedTxs
    }
    queueRepo.registerCallback(callback)
    return () => queueRepo.unregisterCallback(callback)
  }, [queueRepo, loadQueuedTxs])

  useEffect(() => {
    loadQueuedTxs()
  }, [loadQueuedTxs])

  const creation = useMemo(() => {
    return <ProposeTxs open={showNewTxDialog} handleClose={() => setShowNewTxDialog(false)} onConfirm={() => loadQueuedTxs() } />
  }, [showNewTxDialog, setShowNewTxDialog])

  const details = useMemo(() => {
    return <QueuedTxDetails id={selectedId} handleClose={() => setSelectedId(undefined)} />
  }, [selectedId, setSelectedId])

  return (
    <Root>
      <hr />
      <Button onClick={() => setShowNewTxDialog(true)}>Add Transaction</Button>
      {ququedTxs.map((tx) => <QueuedTxSummary transaction={tx} showDetails={(id) => setSelectedId(id)} />)}
      {creation}
      {details}
    </Root>
  );
}

export default Queue;
