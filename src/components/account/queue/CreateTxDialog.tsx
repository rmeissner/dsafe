import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { styled } from '@mui/system'
import { ethers, BigNumber } from 'ethers'
import React, { useState } from 'react'
import { QueuedSafeTransaction } from '../../../logic/db/interactions'
import { SafeTransaction } from '../../../logic/models/transactions'
import { useQueueRepo } from '../../provider/QueueRepositoryProvider'

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    open: boolean
    handleClose: () => void
    handleTx: (tx: QueuedSafeTransaction) => void
}

export const CreateTx: React.FC<Props> = ({ open, handleClose, handleTx }) => {
    const [toString, setToString] = useState("")
    const [valueString, setValueString] = useState("")
    const [dataString, setDataString] = useState("")
    const [nonceString, setNonceString] = useState("")
    const queuedRepo = useQueueRepo()

    const handleCreate = async () => {
        try {
            if (dataString && !ethers.utils.isHexString(dataString)) throw Error("Invalid data")
            const tx: SafeTransaction = {
                to: ethers.utils.getAddress(toString),
                value: BigNumber.from(valueString).toString(),
                data: dataString || "0x",
                nonce: BigNumber.from(nonceString).toString(),
                operation: 0,
                safeTxGas: "0",
                baseGas: "0",
                gasPrice: "0",
                gasToken: ethers.constants.AddressZero,
                refundReceiver: ethers.constants.AddressZero,
            }
            const queuedTx = await queuedRepo.addTx(tx)
            handleTx(queuedTx)
            handleClose()
            setToString("")
            setValueString("")
            setDataString("")
            setNonceString("")
        } catch (e) {
            console.error(e)
        }
    }

    return <TxDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add Tx</DialogTitle>
        <DialogContent>
            <TextField label="To" onChange={(e) => setToString(e.target.value)} value={toString} fullWidth /><br />
            <TextField label="Value" onChange={(e) => setValueString(e.target.value)} value={valueString} fullWidth /><br />
            <TextField label="Data" onChange={(e) => setDataString(e.target.value)} value={dataString} fullWidth /><br />
            <TextField label="Nonce" onChange={(e) => setNonceString(e.target.value)} value={nonceString} fullWidth /><br />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreate}>Create</Button>
        </DialogActions>
    </TxDialog>
}

export default CreateTx