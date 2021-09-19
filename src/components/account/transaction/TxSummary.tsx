import React from 'react'
import { SafeInteraction } from 'safe-indexer-ts'
import TransferTxSummary from './summary/TransferTxSummary'

export interface Props {
    interaction: SafeInteraction,
    showDetails?: (id: string) => void,
    hideDate?: boolean
}
export const TxSummary: React.FC<Props> = ({ interaction, showDetails, hideDate }) => {
    switch (interaction.type) {
        case "multisig_transaction":
        case "module_transaction":
        case "setup":
        case "settings":
            return <div onClick={() => showDetails?.(interaction.id)}>
                {`${interaction.type} - ${interaction.id}`}<br />
                {!hideDate ? `${new Date(interaction.timestamp * 1000)}` : ""}<br />
                <br />
            </div>
        case "transfer":
            return <TransferTxSummary transfer={interaction} hideDate={hideDate} />
        default:
            return <div>
                Unknown Interaction
            </div>
    }
}

export default TxSummary