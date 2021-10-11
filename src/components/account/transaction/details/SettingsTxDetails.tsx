import React, { ReactElement } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { SettingsChangeTx, TransferDetails, TransferTx } from 'safe-indexer-ts'
import { styled } from '@mui/system';
import { Typography } from '@mui/material';
import { Entry, Group, Header, LongText } from '../../../../styled/tables';
import AddressInfo from '../../../utils/AddressInfo';

export interface Props {
    transaction: SettingsChangeTx
}

export const renderSettingsValue = (component: string, value: string): React.ReactNode => {
    switch (component) {
        case 'owners':
        case 'modules':
        case 'fallbackHandler':
            return <AddressInfo address={value} />
        default:
            return <LongText>{value}</LongText>
    }
}

const capitalize = (value: string): string => {
    if (value.length < 2) return value
    return value.slice(0, 1).toUpperCase() + value.slice(1)
}

export const SettingsTxDetails: React.FC<Props> = ({ transaction }) => {
    return <Group>
        <Header>Date:</Header>
        <Entry>
            <Typography>{new Date(transaction.timestamp * 1000).toUTCString()}</Typography>
        </Entry>
        <Header>{capitalize(transaction.component)} {transaction.change}</Header>
        <Entry>
            {renderSettingsValue(transaction.component, transaction.value)}
        </Entry>
        <Header>Ethereum Transaction:</Header>
        <Entry>
            <LongText>{transaction.txHash}</LongText>
        </Entry>
    </Group >
}

export default SettingsTxDetails