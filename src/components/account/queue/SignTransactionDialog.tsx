import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { QueuedSafeTransaction } from '../../../logic/db/interactions'
import { parseSafeSignature, signQueuedTx } from '../../../logic/utils/signatures'
import { useAppSettings } from '../../provider/AppSettingsProvider'
import { useQueueRepo } from '../../provider/QueueRepositoryProvider'
import { useAccount } from '../Dashboard'

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    open: boolean
    transaction?: QueuedSafeTransaction
    handleClose: () => void
    handleNewSignature?: () => void
}

export const SignTransactionDialog: React.FC<Props> = ({ transaction, open, handleClose, handleNewSignature }) => {
    const queuedRepo = useQueueRepo()
    const account = useAccount()
    const { signer, enable } = useAppSettings()

    const handleSign = async () => {
        // TODO: show error for signer
        if (!open || !transaction || !signer) return
        try {
            const accounts = await enable()
            if (accounts.length === 0) throw Error("No accounts available")
            const signature = await signQueuedTx(signer, account, transaction)
            await queuedRepo.addSignature(signature)
            handleNewSignature?.()
            handleClose()
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        handleSign()
    }, [open, transaction])

    return <TxDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Sign Transaction</DialogTitle>
        <DialogContent>
            Check for wallet for signing information
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
    </TxDialog>
}

export default SignTransactionDialog