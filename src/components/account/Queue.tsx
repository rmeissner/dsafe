import { useCallback, useEffect, useMemo, useState } from 'react';
import { Callback, SafeInteraction } from 'safe-indexer-ts';
import { Button, styled } from '@mui/material';
import { useAccount } from './Account';
import SettingsDialog from '../settings/SettingsDialog';
import TxDetails from './transaction/TxDetails';
import TxSummary from './transaction/TxSummary';
import { useTransactionRepo } from '../provider/TransactionRepositoryProvider';
import { QueuedSafeTransaction } from '../../logic/db/interactions';
import CreateTx from './transaction/create/CreateTxDialog';
import { useQueueRepo } from '../provider/QueueRepositoryProvider';

const Root = styled('div')(({ theme }) => ({
  textAlign: "center"
}))

function Queue() {
  const [showNewTxDialog, setShowNewTxDialog] = useState<boolean>(false)
  const [ququedTxs, setQueuedTxs] = useState<QueuedSafeTransaction[]>([])
  const queueRepo = useQueueRepo()

  const loadQueuedTxs = useCallback(async () => {
    try {
      setQueuedTxs(await queueRepo.getQueuedTxs())
    } catch (e) {
      console.error(e)
    }
  }, [queueRepo, setQueuedTxs])

  useEffect(() => {
    loadQueuedTxs()
  }, [loadQueuedTxs])

  const details = useMemo(() => {
    return <CreateTx open={showNewTxDialog} handleClose={() => setShowNewTxDialog(false)} handleTx={() => loadQueuedTxs() } />
  }, [showNewTxDialog, setShowNewTxDialog])

  return (
    <Root>
    <Button onClick={() => setShowNewTxDialog(true)}>Add</Button>
      {ququedTxs.map((e) => <div>
        {`${e.to}`}<br />
        {`${e.nonce}`}
        <br />
      </div>)}
      {details}
    </Root>
  );
}

export default Queue;
