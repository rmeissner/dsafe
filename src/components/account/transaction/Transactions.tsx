import { useCallback, useEffect, useMemo, useState } from 'react';
import { Callback, SafeInteraction } from 'safe-indexer-ts';
import { Button, styled, Typography } from '@mui/material';
import { useAccount } from '../Dashboard';
import SettingsDialog from '../../settings/SettingsDialog';
import TxDetails from './TxDetails';
import TxSummary from './TxSummary';
import { useTransactionRepo } from '../../provider/TransactionRepositoryProvider';

const Root = styled('div')(({ theme }) => ({
  textAlign: "center",
}))

function Transactions() {
  const account = useAccount()
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [txs, setTxs] = useState<SafeInteraction[]>([])
  const accountRepo = useTransactionRepo()

  useEffect(() => {
    const callback: Callback = {
      onNewInteractions: () => {
        accountRepo.getAllTxs().then((loaded) => setTxs(loaded))
      }
    }
    accountRepo.registerCallback(callback)
    return () => accountRepo.unregisterCallback(callback)
  }, [accountRepo, txs, setTxs])

  useEffect(() => {
    // Reset id if account changes
    setSelectedId(undefined)
  }, [account])

  const showDetails = useCallback(async (id) => {
    setSelectedId(id)
  }, [setSelectedId])

  useEffect(() => {
    setTxs([])
    accountRepo.getAllTxs().then((loaded) => setTxs(loaded))
  }, [accountRepo, setTxs])

  const details = useMemo(() => {
    return <TxDetails id={selectedId} handleClose={() => setSelectedId(undefined)} />
  }, [selectedId, setSelectedId])

  return (
    <Root>
      <hr />
      {txs.map((e) => <TxSummary interaction={e} showDetails={(id) => showDetails(id)} />)}
      {details}
    </Root>
  );
}

export default Transactions;
