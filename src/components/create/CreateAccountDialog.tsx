import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { styled } from '@mui/system'
import { ethers, BigNumber } from 'ethers'
import { getAddress } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useAppSettings } from '../provider/AppSettingsProvider'
import { useFactoryRepo } from '../provider/FactoryRepositoryProvider'
import { useDektopLayout } from '../utils/media'

const InnerDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

export interface Props {
    open: boolean
    handleClose: () => void
}

export const CreateAccountDialog: React.FC<Props> = ({ open, handleClose }) => {
    const history = useHistory()
    const factoryRepo = useFactoryRepo()
    const [chainId, setChainId] = useState("")
    const [nonce, setNonce] = useState("")
    const [signerAddress, setSignerAddress] = useState("")
    const { loadProvider, signer, safeSigner } = useAppSettings()

    const connect = async () => {
        try {
            if (chainId) {
                await safeSigner.connect(parseInt(chainId))
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        connect()
    }, [chainId, safeSigner])

    useEffect(() => {
        (async () => {
            try {
                if (!signer || signerAddress.length > 0) return
                setSignerAddress(await signer.getAddress())
            } catch (e) {
                console.error(e)
            }
        })()
    }, [signer, signerAddress, setSignerAddress])

    const cancelCreation = () => {

        handleClose()
    }

    const handleCreate = async () => {
        try {
            const network = parseInt(chainId)
            const provider = loadProvider(network)
            if (!provider) throw Error("No provider available")
            const account = await factoryRepo.newAccount(provider, network, [getAddress(signerAddress)], 1, parseInt(nonce))
            history.push("/" + account.id)
        } catch (e) {
            console.error(e)
        }
    }
    return <InnerDialog open={open} onClose={cancelCreation} maxWidth="md" fullWidth fullScreen={!useDektopLayout()}>
        <DialogTitle>Create Account</DialogTitle>
        <DialogContent>
            <TextField label="Chain Id" onChange={(e) => setChainId(e.target.value)} value={chainId} fullWidth /><br />
            <TextField label="Nonce" onChange={(e) => setNonce(e.target.value)} value={nonce} fullWidth /><br />
            <TextField label="Signer" onChange={(e) => setSignerAddress(e.target.value)} value={signerAddress} fullWidth /><br />
        </DialogContent>
        <DialogActions>
            <Button onClick={cancelCreation}>Cancel</Button>
            <Button onClick={handleCreate} color="primary">Create</Button>
        </DialogActions>
    </InnerDialog>
}

export default CreateAccountDialog