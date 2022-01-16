import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Menu, MenuItem, Select, TextField } from '@mui/material'
import { styled } from '@mui/system'
import { ethers, BigNumber } from 'ethers'
import { getAddress, Indexed } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { ChainInfo, loadChains } from '../../logic/utils/chainInfo'
import { useAppSettings } from '../provider/AppSettingsProvider'
import { useFactoryRepo } from '../provider/FactoryRepositoryProvider'
import { useDektopLayout } from '../utils/media'

const InnerDialog = styled(Dialog)(({ theme }) => ({
    textAlign: "center"
}))

interface ExtendedChainInfo extends ChainInfo {
    supportsRelaying: boolean
}

export interface Props {
    open: boolean
    handleClose: () => void
}

export const CreateAccountDialog: React.FC<Props> = ({ open, handleClose }) => {
    const history = useHistory()
    const factoryRepo = useFactoryRepo()
    const [chains, setChains] = useState<ExtendedChainInfo[]>([])
    const [selectedChainIndex, setSelectedChainIndex] = useState<number | undefined>(undefined)
    const [nonce, setNonce] = useState((Math.round(Math.random() * 10000)).toString())
    const [signerAddress, setSignerAddress] = useState("")
    const { loadProvider, signer, safeSigner } = useAppSettings()

    const connect = async () => {
        try {
            if (open && selectedChainIndex !== undefined)
                await safeSigner.connect(chains[selectedChainIndex].id)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        connect()
    }, [open, selectedChainIndex, chains, safeSigner])

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

    useEffect(() => {
        const chains = loadChains().map((chain) => {
            return {
                ...chain,
                supportsRelaying: factoryRepo.supportsRelaying(chain.id.toString())
            }
        })
        setSelectedChainIndex(undefined)
        setChains(chains)
    }, [])

    const cancelCreation = () => {
        handleClose()
    }

    const handleCreate = async () => {
        try {
            if (!selectedChainIndex) throw Error("No network selected")
            const network = chains[selectedChainIndex].id
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
            {chains.length > 0 ? (<>
                <FormControl sx={{ minWidth: 160, marginTop: "8px", marginBottom: "8px" }}>
                    <InputLabel htmlFor="chain-select">Selected Chain</InputLabel>
                    <Select
                        id="chain-select"
                        value={selectedChainIndex}
                        label="Selected Chain"
                        onChange={(e) => setSelectedChainIndex(e.target.value as number)}
                    >   
                        {chains.map((chain, index) => (
                            <MenuItem value={index}>{chain.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                { selectedChainIndex !== undefined && chains[selectedChainIndex].supportsRelaying && <p>Relay support enabled by default</p>}
                <TextField sx={{ marginTop: "8px", marginBottom: "8px" }} label="Nonce" onChange={(e) => setNonce(e.target.value)} value={nonce} fullWidth /><br />
                <TextField sx={{ marginTop: "8px", marginBottom: "8px" }} label="Signer" onChange={(e) => setSignerAddress(e.target.value)} value={signerAddress} fullWidth /><br />
            </>) : <>Loading Information</>
            }
        </DialogContent>
        <DialogActions>
            <Button onClick={cancelCreation}>Cancel</Button>
            <Button onClick={handleCreate} color="primary">Create</Button>
        </DialogActions>
    </InnerDialog>
}

export default CreateAccountDialog