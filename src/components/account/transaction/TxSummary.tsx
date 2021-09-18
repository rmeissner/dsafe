import React, { ReactElement } from 'react'
import { SafeInteraction } from 'safe-indexer-ts'

export interface Props {
    interaction: SafeInteraction,
    showDetails?: (id: string) => void
}
export const TxSummary: React.FC<Props> = ({ interaction, showDetails }) => {
    switch (interaction.type) {
        case "multisig_transaction":
        case "module_transaction":
        case "transfer":
            return <div onClick={() => showDetails?.(interaction.id)}>
                {`${interaction.type} - ${interaction.id}`}<br />
                {`${new Date(interaction.timestamp * 1000)}`}<br />
                <br />
            </div>
    }
}

export default TxSummary