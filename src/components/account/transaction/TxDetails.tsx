import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { styled } from '@mui/system'
import React, { ReactElement, useEffect, useState } from 'react'
import { SafeInteraction } from 'safe-indexer-ts'
import { useTransactionRepo } from '../../provider/TransactionRepositoryProvider'
import { useDektopLayout } from '../../utils/media'
import { useAccount } from '../Dashboard'
import ModuleTxDetails from './details/ModuleTxDetails'
import MultisigTxDetails from './details/MultisigTxDetails'
import SettingsTxDetails from './details/SettingsTxDetails'
import TransferTxDetails from './details/TransferTxDetails'
import SettingsTxSummary from './summary/SettingsTxSummary'

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    id?: string,
    handleClose: () => void
}

const renderDetails = (interaction?: SafeInteraction): ReactElement => {
    switch (interaction?.type) {
        case "multisig_transaction":
            return (<MultisigTxDetails transaction={interaction} />)
        case "module_transaction":
            return (<ModuleTxDetails transaction={interaction} />)
        case "transfer":
            return (<TransferTxDetails transaction={interaction} />)
        case "settings":
            return <SettingsTxDetails transaction={interaction} />
        default:
            return (<>"Unknown details"</>)
    }
}

export const TxDetails: React.FC<Props> = ({ id, handleClose }) => {
    const [debugLink, setDebugLink] = useState<string | undefined>(undefined)
    const txRepo = useTransactionRepo()
    const account = useAccount()
    const [interaction, setInteraction] = useState<SafeInteraction | undefined>(undefined)
    useEffect(() => {
        setInteraction(undefined)
        if (!id) return
        const loadInteraction = async () => {
            try {
                setInteraction(await txRepo.getTx(id))
            } catch {
                handleClose()
            }
        }
        loadInteraction()
    }, [id, txRepo, setInteraction, handleClose])

    useEffect(() => {
        if (!interaction) {
            setDebugLink(undefined)
            return
        }
        let link = "https://dashboard.tenderly.co/tx/"
        link += account.chainId + "/"
        link += interaction?.txHash
        setDebugLink(link)
    }, [interaction, account])
    return <TxDialog open={!!id} onClose={handleClose} maxWidth="md" fullWidth fullScreen={!useDektopLayout()}>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
            {renderDetails(interaction)}
        </DialogContent>
        <DialogActions>
            {debugLink && (<Button onClick={() => { window.open(debugLink, "_blank") }}>Debug</Button>)}
            <Button onClick={handleClose}>Close</Button>
        </DialogActions>
    </TxDialog>
}

export default TxDetails