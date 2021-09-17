import { Dialog, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import { styled } from '@mui/system'
import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { SafeInteraction } from 'safe-indexer-ts'
import { InteractionsDB } from '../../../logic/db/interactions'
import { useAccount } from '../Account'
import ModuleTxDetails from './details/ModuleTxDetails'
import MultisigTxDetails from './details/MultisigTxDetails'

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
        default: 
            return (<>"Loading..."</>)
    }
}

export const TxDetails: React.FC<Props> = ({ id, handleClose }) => {
    const { address: account } = useAccount()
    const [interaction, setInteraction] = useState<SafeInteraction | undefined>(undefined)
    const db = useMemo(() => { return new InteractionsDB(account) }, [account])
    useEffect(() => {
        setInteraction(undefined)
        if (!id) return
        const loadInteraction = async () => {
            try {
                setInteraction(await db.get(id))
            } catch {
                handleClose()
            }
        }
        loadInteraction()
    }, [id, db, setInteraction, handleClose])
    return <TxDialog open={!!id} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
            {renderDetails(interaction)}
        </DialogContent>
    </TxDialog>
}

export default TxDetails