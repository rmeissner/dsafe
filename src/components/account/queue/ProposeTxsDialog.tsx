import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { styled } from '@mui/system'
import { ethers, BigNumber } from 'ethers'
import React, { useEffect, useMemo, useState } from 'react'
import { QueuedSafeTransaction } from '../../../logic/db/interactions'
import { SafeTransaction, MetaTransaction } from '../../../logic/models/transactions'
import { buildTx } from '../../../logic/utils/proposing'
import { useQueueRepo } from '../../provider/QueueRepositoryProvider'
import { useDektopLayout } from '../../utils/media'
import { useAccount } from '../Dashboard'

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    open: boolean
    handleClose: () => void
    onConfirm: (tx: QueuedSafeTransaction, requestId?: string) => void
    onReject?: (message: string, requestId?: string) => void
    transactions?: MetaTransaction[]
    requestId?: string
}

export const ProposeTxs: React.FC<Props> = ({ open, handleClose, onConfirm, onReject, requestId, transactions }) => {
    const [toString, setToString] = useState("")
    const [valueString, setValueString] = useState("")
    const [dataString, setDataString] = useState("")
    const [operationString, setOperationString] = useState("")
    const [nonceString, setNonceString] = useState("")
    const queuedRepo = useQueueRepo()
    const account = useAccount()

    useEffect(() => {
        if (!open) return
        (async () => {
            try {
                setNonceString(await queuedRepo.getNextNonce())
            } catch (e) {
                console.error(e)
            }
        })()
    }, [queuedRepo, open])

    useEffect(() => {
        const defaultTx = buildTx(account, transactions)
        setToString(defaultTx.to)
        setValueString(defaultTx.value)
        setDataString(defaultTx.data)
        setOperationString(defaultTx.operation.toString())
    }, [account, transactions])

    const cancelCreation = () => {
        onReject?.("Canceled", requestId)
        handleClose()
    }

    const handleCreate = async () => {
        try {
            if (dataString && !ethers.utils.isHexString(dataString)) throw Error("Invalid data")
            const tx: SafeTransaction = {
                to: ethers.utils.getAddress(toString),
                value: BigNumber.from(valueString).toString(),
                data: dataString || "0x",
                nonce: parseInt(nonceString),
                operation: parseInt(operationString),
                safeTxGas: "0",
                baseGas: "0",
                gasPrice: "0",
                gasToken: ethers.constants.AddressZero,
                refundReceiver: ethers.constants.AddressZero,
            }
            const queuedTx = await queuedRepo.addTx(tx)
            onConfirm(queuedTx, requestId)
            handleClose()
            setToString("")
            setValueString("")
            setDataString("")
            setOperationString("")
            setNonceString("")
        } catch (e) {
            console.error(e)
        }
    }
    return <TxDialog open={open} onClose={cancelCreation} maxWidth="md" fullWidth fullScreen={!useDektopLayout()}>
        <DialogTitle>Add Tx</DialogTitle>
        <DialogContent>
            <TextField label="To" onChange={(e) => setToString(e.target.value)} value={toString} fullWidth /><br />
            <TextField label="Value" onChange={(e) => setValueString(e.target.value)} value={valueString} fullWidth /><br />
            <TextField label="Data" onChange={(e) => setDataString(e.target.value)} value={dataString} fullWidth /><br />
            <TextField label="Operation" onChange={(e) => setOperationString(e.target.value)} value={operationString} fullWidth /><br />
            <TextField label="Nonce" onChange={(e) => setNonceString(e.target.value)} value={nonceString} fullWidth /><br />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelCreation}>Cancel</Button>
          <Button onClick={handleCreate} color="primary">Create</Button>
        </DialogActions>
    </TxDialog>
}

export default ProposeTxs