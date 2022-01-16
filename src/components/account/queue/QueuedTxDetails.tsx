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
import { copyToClipboard, useDektopLayout } from '../../utils/media';
import TxData from '../../utils/TxData';
import { useAccount } from '../Dashboard';
import { BigNumber } from '@ethersproject/bignumber';
import { useAppSettings } from '../../provider/AppSettingsProvider';
import { buildSignatureBytes, prepareSignatures } from '../../../logic/utils/execution';
import { PopulatedTransaction } from '@ethersproject/contracts';
import AddressInfo from '../../utils/AddressInfo';
import RelayTxDialog from './RelayTxDialog';
import { useFactoryRepo } from '../../provider/FactoryRepositoryProvider';

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    id?: string,
    handleClose: () => void
}

const shareSignature = (sig: SafeTransactionSignature) => {
    const shareText = shareableSignatureString(sig)
    copyToClipboard(shareText, "Signature copied to clipboard!")
}

export const QueuedTxDetails: React.FC<Props> = ({ id, handleClose }) => {
    const [simulateLink, setSimulateLink] = useState<string | undefined>(undefined)
    const [showAddSignature, setShowAddSignature] = useState(false)
    const [showSignTransaction, setShowSignTransaction] = useState(false)
    const [showExecuteTransaction, setShowExecuteTransaction] = useState(false)
    const [showRelayTransaction, setShowRelayTransaction] = useState(false)
    const factory = useFactoryRepo()
    const repo = useQueueRepo()
    const account = useAccount()
    const { signer } = useAppSettings()

    const deleteTx = useCallback(async(id?: string) => {
        if (!id) return
        try {
            await repo.deleteTx(id)
            handleClose()
        } catch (e) {
            console.error(e)
        }
    }, [repo, handleClose])

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
        } catch (e) {
            console.error(e)
        }
    }, [id, repo, setSignatures])
    useEffect(() => {
        setSignatures(undefined)
        loadSignatures()
    }, [loadSignatures])
    useEffect(() => {
        if (!transaction || transaction.operation !== 0) {
            setSimulateLink(undefined)
            return
        }
        (async () => {
            let populatedTx: PopulatedTransaction | undefined
            if (signer && signatures) {
                try {
                    const submitterAddress = await signer.getAddress()
                    const safe = await factory.getSafeForAccount(account, signer.provider)
                    const status = await safe.status()
                    const signatureBytes = buildSignatureBytes(await prepareSignatures(status, transaction, signatures, submitterAddress))
                    populatedTx = await safe.populateTx({
                        signatures: signatureBytes,
                        ...transaction
                    })
                    populatedTx.from = submitterAddress
                } catch (e) {
                    console.error(e)
                }
            }
            try {
                let link = "https://dashboard.tenderly.co/simulator/new?"
                link += "network=" + account.chainId + "&"
                if (populatedTx) {
                    link += "from=" + populatedTx.from + "&"
                    link += "contractAddress=" + populatedTx.to + "&"
                    link += "rawFunctionInput=" + populatedTx.data + "&"
                    link += "value=" + BigNumber.from(populatedTx.value || "0").toString() + "&"
                } else {
                    link += "from=" + account.address + "&"
                    link += "contractAddress=" + transaction.to + "&"
                    link += "rawFunctionInput=" + transaction.data + "&"
                    link += "value=" + BigNumber.from(transaction.value).toString() + "&"
                }
                setSimulateLink(link)
            } catch (e) {
                console.error(e)
            }
        })()
    }, [transaction, account, signer, repo, signatures])
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
                            <AddressInfo address={transaction.to} />
                        </Entry>
                        <Header>Value:</Header>
                        <Entry>
                            <Typography>{transaction.value}</Typography>
                        </Entry>
                        <Header>Data:</Header>
                        <TxData data={transaction.data} />
                        <Header>Nonce:</Header>
                        <Entry>
                            <LongText>{transaction.nonce}</LongText>
                        </Entry>
                        <Header>Signatures:</Header>
                        {signatures?.map((sig) => (<Entry>
                            <AddressInfo onClick={() => { shareSignature(sig) }} address={sig.signer} />
                        </Entry>))}
                        <Button onClick={() => setShowSignTransaction(true)}>Sign</Button>
                        <Button onClick={() => setShowAddSignature(true)}>Add</Button>
                        <Button onClick={() => setShowExecuteTransaction(true)}>Execute</Button>
                        <Button onClick={() => setShowRelayTransaction(true)}>Relay</Button>
                        <Button onClick={() => deleteTx(id)} color="error">Delete Tx</Button>
                    </Group>
                ) : (
                    <>"Unknown details"</>
                )}
            </DialogContent>
            <DialogActions>
                {simulateLink && (<Button onClick={() => { window.open(simulateLink, "_blank") }}>Simulate</Button>)}
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </TxDialog>
        <AddSignatureDialog open={showAddSignature} handleClose={() => setShowAddSignature(false)} handleNewSignature={loadSignatures} safeTxHash={id} />
        <SignTransactionDialog open={showSignTransaction} handleClose={() => setShowSignTransaction(false)} handleNewSignature={loadSignatures} transaction={transaction} />
        <ExecuteTxDialog open={showExecuteTransaction} handleClose={() => setShowExecuteTransaction(false)} handleTxSubmitted={handleClose} transaction={transaction} />
        <RelayTxDialog open={showRelayTransaction} handleClose={() => setShowRelayTransaction(false)} handleTxSubmitted={handleClose} transaction={transaction} />
    </>
}

export default QueuedTxDetails