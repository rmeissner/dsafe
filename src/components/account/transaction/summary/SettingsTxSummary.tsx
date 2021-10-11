import styled from '@emotion/styled';
import React from 'react'
import { SettingsChangeTx } from 'safe-indexer-ts'
import { Entry, Group, LongText } from '../../../../styled/tables';
import AddressInfo from '../../../utils/AddressInfo';
import { renderSettingsValue } from '../details/SettingsTxDetails';

export interface Props {
    settingsChange: SettingsChangeTx,
    showDetails?: (id: string) => void,
    hideDate?: boolean
}

const Summary = styled(Entry)(({ theme }) => ({
    display: 'inline-block',
    width: '100%',
    wordWrap: 'break-word'
}))

export const SettingsTxSummary: React.FC<Props> = ({ settingsChange, hideDate, showDetails }) => {
    return <Summary onClick={() => showDetails?.(settingsChange.id)}>
        {`${settingsChange.component} ${settingsChange.change}`}
        {hideDate && renderSettingsValue(settingsChange.component, settingsChange.value)}
        {!hideDate && (<>
            <br />{new Date(settingsChange.timestamp * 1000).toUTCString()}
        </>)}
    </Summary>
}

export default SettingsTxSummary