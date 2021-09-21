import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { styled } from '@mui/system'
import React, { ReactElement, useEffect, useState } from 'react'
import { SafeInteraction } from 'safe-indexer-ts'
import { useTransactionRepo } from '../../provider/TransactionRepositoryProvider'
import ModuleTxDetails from './details/ModuleTxDetails'
import MultisigTxDetails from './details/MultisigTxDetails'
import TransferTxDetails from './details/TransferTxDetails'

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    id?: string,
    handleClose: () => void
}

const renderDetails = (interaction?: SafeInteraction): ReactElement => {
    switch(interaction?.type) {
        case "multisig_transaction":
            return (<MultisigTxDetails transaction={interaction} />)
        case "module_transaction":
            return (<ModuleTxDetails transaction={interaction} />)
        case "transfer":
            return (<TransferTxDetails transaction={interaction} />)
        default: 
            return (<>"Unknown details"</>)
    }
}

export const TxDetails: React.FC<Props> = ({ id, handleClose }) => {
    const accountRepo = useTransactionRepo()
    const [interaction, setInteraction] = useState<SafeInteraction | undefined>(undefined)
    useEffect(() => {
        setInteraction(undefined)
        if (!id) return
        const loadInteraction = async () => {
            try {
                setInteraction(await accountRepo.getTx(id))
            } catch {
                handleClose()
            }
        }
        loadInteraction()
    }, [id, accountRepo, setInteraction, handleClose])
    return <TxDialog open={!!id} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
            {renderDetails(interaction)}
        </DialogContent>
    </TxDialog>
}

export default TxDetails