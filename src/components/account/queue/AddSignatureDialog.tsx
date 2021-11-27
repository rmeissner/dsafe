import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { styled } from '@mui/system'
import React, { useState } from 'react'
import { parseSafeSignature } from '../../../logic/utils/signatures'
import { useQueueRepo } from '../../provider/QueueRepositoryProvider'

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    open: boolean
    safeTxHash?: string
    handleClose: () => void
    handleNewSignature?: () => void
}

export const AddSignatureDialog: React.FC<Props> = ({ safeTxHash, open, handleClose, handleNewSignature }) => {
    const [signatureString, setSignatureString] = useState("")
    const queuedRepo = useQueueRepo()

    const handleAdd = async () => {
        if (!safeTxHash) return
        try {
            const signature = await parseSafeSignature(signatureString, safeTxHash)
            await queuedRepo.addSignature(signature)
            handleNewSignature?.()
            handleClose()
            setSignatureString("")
        } catch (e) {
            console.error(e)
        }
    }

    return <TxDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add Signature</DialogTitle>
        <DialogContent>
            <TextField label="Signature" onChange={(e) => setSignatureString(e.target.value)} value={signatureString} fullWidth /><br />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdd}>Add</Button>
        </DialogActions>
    </TxDialog>
}

export default AddSignatureDialog