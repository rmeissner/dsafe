import React from 'react'
import { QueuedSafeTransaction } from '../../../logic/db/interactions'

export interface Props {
    transaction: QueuedSafeTransaction,
    showDetails?: (id: string) => void
}
export const QueuedTxSummary: React.FC<Props> = ({ transaction, showDetails }) => {
    return <div onClick={() => showDetails?.(transaction.id)}>
        {transaction.to}<br />
        {transaction.nonce} - {transaction.version} - {transaction.id.slice(0, 10)}<br />
    </div>
}

export default QueuedTxSummary