import styled from '@emotion/styled';
import React, { ReactElement } from 'react'
import { SafeInteractionEvent, Event, TransferTx } from 'safe-indexer-ts'
import { Entry, Group, Header } from '../../../../styled/tables';
import TxSummary from '../TxSummary';

export interface Props {
    transfer: TransferTx,
    showDetails?: (id: string) => void,
    hideDate?: boolean
}

const Summary = styled(Entry)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column'
}))

export const TransferTxSummary: React.FC<Props> = ({ transfer, hideDate, showDetails }) => {
    return <Summary onClick={() => showDetails?.(transfer.id)}>
        {`${transfer.direction} ${transfer.details.type} Transfer`}
        {!hideDate && (<>
            <br />{new Date(transfer.timestamp * 1000).toUTCString()}
        </>)}
    </Summary>
}

export default TransferTxSummary