import { Button, Dialog, DialogContent, DialogTitle, Switch, TextField, Typography } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import { Callback } from 'safe-indexer-ts'
import { Group, Row } from '../../styled/tables'
import { useAppSettings } from '../provider/AppSettingsProvider'
import { useTransactionRepo } from '../provider/TransactionRepositoryProvider'

export interface Props {
    open: boolean,
    handleClose: () => void,
    reindex?: () => void,
}

export const SettingsDialog: React.FC<Props> = ({ open, reindex, handleClose }) => {
    const {
        useCustomRpc, toggleCustomRpc,
        customRpc, updateCustomRpc,
        relayService, updateRelayService,
        networkConfig, updateNetworkConfig,
        infuraToken, updateInfuraToken
    } = useAppSettings()
    const [status, setStatus] = useState<string>("")
    const txRepo = useTransactionRepo()

    useEffect(() => {
        const callback: Callback = {
            onNewInteractions: () => { },
            onStatusUpdate: (update) => {
                switch (update.type) {
                    case "up_to_date":
                        setStatus(`Up to date with block ${update.latestBlock}`)
                        break;
                    case "processing":
                        setStatus(`Indexing block ${update.fromBlock}/${update.latestBlock}`)
                        break;
                    case "aborted":
                        setStatus(`Indexing aborted: ${update.reason}`)
                        break;
                    default:
                        setStatus("")
                        break;
                }
            }
        }
        txRepo.registerCallback(callback)
        return () => txRepo.unregisterCallback(callback)
    }, [txRepo, setStatus])

    const updateStartingBlock = useCallback((value: string) => {
        try {
            updateNetworkConfig({
                startingBlock: parseInt(value),
                maxBlocks: networkConfig.maxBlocks
            })
        } catch (e) {
            console.error(e)
        }
    }, [networkConfig, updateNetworkConfig])

    const updateMaxBlocks = useCallback((value: string) => {
        try {
            updateNetworkConfig({
                startingBlock: networkConfig.startingBlock,
                maxBlocks: parseInt(value)
            })
        } catch (e) {
            console.error(e)
        }
    }, [networkConfig, updateNetworkConfig])

    return <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
            <Group>
                <Typography variant="caption">Status</Typography>
                {status}
                <br /><br />
                <Typography variant="caption">App Settings</Typography>
                <Row sx={{ alignItems: 'center' }}>
                    Use custom prc endpoint <Switch checked={useCustomRpc} onChange={(_, checked) => toggleCustomRpc(checked)} /><br />
                </Row>
                <TextField label="Relay" onChange={(e) => updateRelayService(e.target.value)} value={relayService} fullWidth /><br />
                <TextField label="RPC" onChange={(e) => updateCustomRpc(e.target.value)} value={customRpc} fullWidth /><br />
                <TextField label="Infura Token" onChange={(e) => updateInfuraToken(e.target.value)} value={infuraToken} fullWidth /><br />
                <TextField label="Intital block" onChange={(e) => updateStartingBlock(e.target.value)} value={networkConfig.startingBlock} fullWidth /><br />
                <TextField label="Max blocks" onChange={(e) => updateMaxBlocks(e.target.value)} value={networkConfig.maxBlocks} fullWidth /><br />
                {
                    !!reindex && (<>
                        <Typography variant="caption">Account Settings</Typography><br />
                        <Button onClick={() => reindex()}>Reindex</Button><br />
                    </>)
                }
            </Group>
        </DialogContent>
    </Dialog>
}

export default SettingsDialog