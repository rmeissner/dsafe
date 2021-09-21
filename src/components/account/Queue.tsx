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

function Queue() {
  return (
    <Root>
    </Root>
  );
}

export default Queue;
