import React from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { MultisigTx } from 'safe-indexer-ts'
import { Typography } from '@mui/material';
import { Entry, Group, Header, LongText } from '../../../../styled/tables';
import TxEvents from './TxEvents';
import TxData from '../../../utils/TxData';
import AddressInfo from '../../../utils/AddressInfo';

export interface Props {
    transaction: MultisigTx
}

export const MultisigTxDetails: React.FC<Props> = ({ transaction }) => {
    return <Group>
        <Header>Date:</Header>
        <Entry>
            <Typography>{new Date(transaction.timestamp * 1000).toUTCString()}</Typography>
        </Entry>
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
            <LongText>{transaction.txHash}</LongText>
        </Entry>
        <Header>Id:</Header>
        <Entry>
            <LongText>{transaction.safeTxHash}</LongText>
        </Entry>
        {transaction.details ? (
            <Group>
                <Header>Operation:</Header>
                <Entry>
                    <Typography>{transaction.details.operation}</Typography>
                </Entry>
                <Header>To:</Header>
                <Entry>
                    <AddressInfo address={transaction.details.to} />
                </Entry>
                <Header>Value:</Header>
                <Entry>
                    <Typography>{transaction.details.value}</Typography>
                </Entry>
                <Header>Data:</Header>
                <TxData data={transaction.details.data} />
                <Header>Nonce:</Header>
                <Entry>
                    <LongText>{transaction.details.nonce}</LongText>
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