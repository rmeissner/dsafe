import styled from '@emotion/styled';
import React, { ReactElement } from 'react'
import { SafeInteractionEvent, Event, TransferTx, SettingsChangeTx } from 'safe-indexer-ts'
import { Entry, Group, Header } from '../../../../styled/tables';
import TxSummary from '../TxSummary';

export interface Props {
    settingsChange: SettingsChangeTx,
    showDetails?: (id: string) => void,
    hideDate?: boolean
}

const Summary = styled(Entry)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column'
}))

export const SettingsTxSummary: React.FC<Props> = ({ settingsChange, hideDate, showDetails }) => {
    return <Summary onClick={() => showDetails?.(settingsChange.id)}>
        {`${settingsChange.component} ${settingsChange.change}: ${settingsChange.value}`}
        {!hideDate && (<>
            <br />{new Date(settingsChange.timestamp * 1000).toUTCString()}
        </>)}
    </Summary>
}

export default SettingsTxSummary