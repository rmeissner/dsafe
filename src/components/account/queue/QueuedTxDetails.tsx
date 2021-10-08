import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { styled } from '@mui/system'
import React, { useCallback, useEffect, useState } from 'react'
import { Entry, Group, Header, LongText } from '../../../styled/tables';
import { QueuedSafeTransaction } from '../../../logic/db/interactions'
import { useQueueRepo } from '../../provider/QueueRepositoryProvider'
import { SafeTransactionSignature } from '../../../logic/models/transactions';
import AddSignatureDialog from './AddSignatureDialog';
import SignTransactionDialog from './SignTransactionDialog';
import ExecuteTxDialog from './ExecuteTxDialog';
import { shareableSignatureString } from '../../../logic/utils/signatures';
import { useDektopLayout } from '../../utils/media';

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    id?: string,
    handleClose: () => void
}

const shareSignature = (sig: SafeTransactionSignature) => {
    const shareText = shareableSignatureString(sig)
    console.log({shareText})
    navigator.clipboard.writeText(shareText)
}

export const QueuedTxDetails: React.FC<Props> = ({ id, handleClose }) => {
    const [showAddSignature, setShowAddSignature] = useState<boolean>(false)
    const [showSignTransaction, setShowSignTransaction] = useState<boolean>(false)
    const [showExecuteTransaction, setShowExecuteTransaction] = useState<boolean>(false)
    const repo = useQueueRepo()

    const [transaction, setTransaction] = useState<QueuedSafeTransaction | undefined>(undefined)
    useEffect(() => {
        setTransaction(undefined)
        if (!id) return
        const load = async () => {
            try {
                setTransaction(await repo.getTx(id))
            } catch {
                handleClose()
            }
        }
        load()
    }, [id, repo, setTransaction, handleClose])

    const [signatures, setSignatures] = useState<SafeTransactionSignature[] | undefined>(undefined)
    const loadSignatures = useCallback(async () => {
        console.log("Load Signatures")
        if (!id) return
        try {
            setSignatures(await repo.getSignatures(id))
        } catch(e) {
            console.error(e)
        }
    }, [id, repo, setSignatures])
    useEffect(() => {
        setSignatures(undefined)
        loadSignatures()
    }, [loadSignatures])
    return <>
        <TxDialog open={!!id && !showAddSignature} onClose={handleClose} maxWidth="md" fullWidth fullScreen={!useDektopLayout()}>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogContent>
                {transaction ? (
                    <Group>
                        <Header>Id:</Header>
                        <Entry>
                            <LongText>{transaction.id}</LongText>
                        </Entry>
                        <Header>Operation:</Header>
                        <Entry>
                            <Typography>{transaction.operation}</Typography>
                        </Entry>
                        <Header>To:</Header>
                        <Entry>
                            <Typography>{transaction.to}</Typography>
                        </Entry>
                        <Header>Value:</Header>
                        <Entry>
                            <Typography>{transaction.value}</Typography>
                        </Entry>
                        <Header>Data:</Header>
                        <Entry>
                            <LongText>{transaction.data}</LongText>
                        </Entry>
                        <Header>Nonce:</Header>
                        <Entry>
                            <LongText>{transaction.nonce}</LongText>
                        </Entry>
                        <Header>Signatures:</Header>
                        {signatures?.map((sig) => (<Entry>
                            <LongText onClick={() => { shareSignature(sig) }}>{sig.signer}</LongText>
                        </Entry>))}
                        <Button onClick={() => setShowSignTransaction(true)}>Sign</Button>
                        <Button onClick={() => setShowAddSignature(true)}>Add</Button>
                        <Button onClick={() => setShowExecuteTransaction(true)}>Execute</Button>
                    </Group>
                ) : (
                    <>"Unknown details"</>
                )}
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </TxDialog>
        <AddSignatureDialog open={showAddSignature} handleClose={() => setShowAddSignature(false) } handleNewSignature={loadSignatures} safeTxHash={id} />
        <SignTransactionDialog open={showSignTransaction} handleClose={() => setShowSignTransaction(false) } handleNewSignature={loadSignatures} transaction={transaction} />
        <ExecuteTxDialog open={showExecuteTransaction} handleClose={() => setShowExecuteTransaction(false) } handleTxSubmitted={handleClose} transaction={transaction} />
    </>
}

export default QueuedTxDetails