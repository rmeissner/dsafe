import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect } from 'react'
import { QueuedSafeTransaction } from '../../../logic/db/interactions'
import { useAppSettings } from '../../provider/AppSettingsProvider'
import { useQueueRepo } from '../../provider/QueueRepositoryProvider'

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    open: boolean
    transaction?: QueuedSafeTransaction
    handleClose: () => void
    handleTxSubmitted?: (ethereumTxHash: string) => void
}

export const ExecuteTxDialog: React.FC<Props> = ({ transaction, open, handleClose, handleTxSubmitted }) => {
    const queuedRepo = useQueueRepo()
    const { signer, enable } = useAppSettings()

    const handleExecution = async () => {
        // TODO: show error for signer
        if (!open || !transaction || !signer) return
        try {
            const accounts = await enable()
            if (accounts.length === 0) throw Error("No accounts available")
            const signatures = await queuedRepo.getSignatures(transaction.id)
            const ethereumTxHash = await queuedRepo.submitTx(transaction, signer, signatures)
            handleTxSubmitted?.(ethereumTxHash)
            handleClose()
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        handleExecution()
    }, [open, transaction])

    return <TxDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
    <DialogTitle>Execute Transaction</DialogTitle>
        <DialogContent>
            Check for wallet for signing information
        </DialogContent>
        <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        </DialogActions>
    </TxDialog>
}

export default ExecuteTxDialog