import React from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { MultisigTx } from 'safe-indexer-ts'
import { Typography } from '@mui/material';
import { Entry, Group, Header, LongText } from '../../../../styled/tables';
import TxEvents from './TxEvents';

export interface Props {
    transaction: MultisigTx
}

export const MultisigTxDetails: React.FC<Props> = ({ transaction }) => {
    return <Group>
        <Header>Status:</Header>
        <Entry>
            {transaction.success ? (
                <><Typography>Success</Typography><CheckCircleIcon color="success" /></>
            ) : (
                <><Typography>Error</Typography><ErrorIcon color="error" /></>
            )}
        </Entry>
        <Header>Ethereum Transaction:</Header>
        <Entry>
            <Typography>{transaction.txHash}</Typography>
        </Entry>
        {transaction.details ? (
            <Group>
                <Header>Operation:</Header>
                <Entry>
                    <Typography>{transaction.details.operation}</Typography>
                </Entry>
                <Header>To:</Header>
                <Entry>
                    <Typography>{transaction.details.to}</Typography>
                </Entry>
                <Header>Value:</Header>
                <Entry>
                    <Typography>{transaction.details.value}</Typography>
                </Entry>
                <Header>Data:</Header>
                <Entry>
                    <LongText>{transaction.details.data}</LongText>
                </Entry>
                <Header>Signatures:</Header>
                <Entry>
                    <LongText>{transaction.details.signatures}</LongText>
                </Entry>
            </Group>
        ) : (
            <Entry>No details available</Entry>
        )}
        <TxEvents interactions={transaction.logs} />
    </Group>
}

export default MultisigTxDetails