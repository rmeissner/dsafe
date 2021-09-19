import React from 'react'
import { SafeInteraction } from 'safe-indexer-ts'
import SettingsTxSummary from './summary/SettingsTxSummary'
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
            return <div onClick={() => showDetails?.(interaction.id)}>
                {`${interaction.type}`}<br />
                {!hideDate ? `${new Date(interaction.timestamp * 1000).toUTCString()}` : ""}<br />
                <br />
            </div>
        case "settings":
            return <SettingsTxSummary settingsChange={interaction} hideDate={hideDate} showDetails={showDetails} />
        case "transfer":
            return <TransferTxSummary transfer={interaction} hideDate={hideDate} showDetails={showDetails} />
        default:
            return <div>
                Unknown Interaction
            </div>
    }
}

export default TxSummary