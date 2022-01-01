import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect } from 'react'
import { QueuedSafeTransaction } from '../../../logic/db/interactions'
import { useAppSettings } from '../../provider/AppSettingsProvider'
import { useQueueRepo } from '../../provider/QueueRepositoryProvider'
import { useRelayRepo } from '../../provider/RelayRepositoryProvider'
import { useAccount } from '../Dashboard'

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    open: boolean
    transaction?: QueuedSafeTransaction
    handleClose: () => void
    handleTxSubmitted?: (ethereumTxHash: string) => void
}

export const RelayTxDialog: React.FC<Props> = ({ transaction, open, handleClose, handleTxSubmitted }) => {
    const account = useAccount()
    const queuedRepo = useQueueRepo()
    const relayRepo = useRelayRepo()

    const handleExecution = async () => {
        if (!open || !transaction || !relayRepo.connected()) return
        try {
            const signatures = await queuedRepo.getSignatures(transaction.id)
            const { to, data } = await queuedRepo.populateTx(transaction, signatures)
            if (!to) throw Error("Missing `to`")
            if (!data) throw Error("Missing `data`")

            const chainId = account.chainId

            const relayId = await relayRepo.relayTransaction(chainId, to, data)
            
            handleTxSubmitted?.(relayId)
            handleClose()
        } catch (e) {
            console.error(e)
            handleClose()
        }
    }

    useEffect(() => {
        handleExecution()
    }, [open, transaction])

    return <TxDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
    <DialogTitle>Relay Transaction</DialogTitle>
        <DialogContent>
            Check for wallet for signing information
        </DialogContent>
        <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        </DialogActions>
    </TxDialog>
}

export default RelayTxDialog