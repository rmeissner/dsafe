import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import { styled } from '@mui/system'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { Account } from '../../../logic/utils/account'
import { Safe, SafeStatus } from '../../../logic/utils/safe'
import { parseSafeSignature } from '../../../logic/utils/signatures'
import { Entry, Group, Header, LongText, Row } from '../../../styled/tables'
import { useAppSettings } from '../../provider/AppSettingsProvider'
import { useFactoryRepo } from '../../provider/FactoryRepositoryProvider'
import { useQueueRepo } from '../../provider/QueueRepositoryProvider'
import AddressInfo from '../../utils/AddressInfo'
import { useAccount } from '../Dashboard'

const TxDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    open: boolean
    handleClose: () => void
}

const renderInfo = (safeInfo: SafeStatus): React.ReactNode => {

    return (<>
        <Header>Signers</Header>
        {safeInfo.owners.map((signer) => (<Entry>
            <AddressInfo address={signer} />
        </Entry>))}
        <Header sx={{ paddingBottom: "4px"}}>Details</Header>
        <Group sx={{alignItems: "start", paddingBottom: "8px"}}>
            <Typography variant="caption">Version</Typography>
            {safeInfo.version.toString()}
        </Group>
        <Group sx={{alignItems: "start", paddingBottom: "8px"}}>
            <Typography variant="caption">Treshold</Typography>
            {safeInfo.threshold.toString()}
        </Group>
        <Group sx={{alignItems: "start"}}>
            <Typography variant="caption">Nonce</Typography>
            {safeInfo.nonce.toString()}
        </Group>
    </>)
}

export const SafeInfoDialog: React.FC<Props> = ({ open, handleClose }) => {

    const factoryRepo = useFactoryRepo()
    const history = useHistory()
    const { loadProvider } = useAppSettings()
    const account = useAccount()

    const [safeInfo, setSafeInfo] = useState<SafeStatus | undefined>(undefined)

    const showSafeSelection = () => {
        history.push("/")
    }

    useEffect(() => {
        (async () => {
            try {
                const provider = loadProvider(account.chainId)
                const safe = await factoryRepo.getSafeForAccount(account, provider)
                setSafeInfo(await safe.status())
            } catch (e) {
                // TODO show error
                console.error(e)
            }
        })()
    }, [account, factoryRepo])

    return <TxDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Safe Info</DialogTitle>
        <DialogContent>
            <Button onClick={showSafeSelection}>Switch Safe</Button> 
            <Header>Active Safe</Header>
            <Entry>
                <AddressInfo address={account.address} />
            </Entry>
            {safeInfo ? renderInfo(safeInfo) : (<CircularProgress />)}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Close</Button>
        </DialogActions>
    </TxDialog>
}

export default SafeInfoDialog