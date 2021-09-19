import React, { ReactElement } from 'react'
import { SafeInteractionEvent, Event, TransferTx } from 'safe-indexer-ts'
import { Entry, Group, Header } from '../../../../styled/tables';
import TxSummary from '../TxSummary';

export interface Props {
    transfer: TransferTx,
    hideDate?: boolean
}

export const TransferTxSummary: React.FC<Props> = ({ transfer, hideDate }) => {
    return <Group style={{textAlign: "center"}}>
        <Entry style={{textAlign: "center"}}>
            {`${transfer.direction} ${transfer.details.type} Transfer`}
        </Entry>
        {!hideDate && (
            <Entry style={{textAlign: "center"}}>
                 {new Date(transfer.timestamp * 1000).toUTCString()}
            </Entry>
        )}
    </Group>
}

export default TransferTxSummary