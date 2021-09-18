import { Button, Dialog, DialogContent, DialogTitle, Switch, TextField, Typography } from '@mui/material'
import React, { useCallback } from 'react'
import { useAppSettings } from '../provider/AppSettingsProvider'

export interface Props {
    open: boolean,
    handleClose: () => void,
    reindex?: () => void,
}

export const SettingsDialog: React.FC<Props> = ({open, reindex, handleClose}) => {
    const { useCustomRpc, toggleCustomRpc, customRpc, updateCustomRpc, networkConfig, updateNetworkConfig } = useAppSettings()
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
            <Typography variant="caption">App Settings</Typography><br />
            Use custom prc endpoint <Switch checked={useCustomRpc} onChange={(_, checked) => toggleCustomRpc(checked) } /><br /><br />
            <TextField label="RPC" onChange={(e) => updateCustomRpc(e.target.value)} value={customRpc} fullWidth /><br /><br />
            <TextField label="Intital block" onChange={(e) => updateStartingBlock(e.target.value)} value={networkConfig.startingBlock} fullWidth /><br /><br />
            <TextField label="Max blocks" onChange={(e) => updateMaxBlocks(e.target.value)} value={networkConfig.maxBlocks} fullWidth /><br /><br />
            {
                !!reindex && (<>
                    <Typography variant="caption">Account Settings</Typography><br />
                    <Button onClick={() => reindex()}>Reindex</Button><br /><br />
                </>)
            }
        </DialogContent>
    </Dialog>
}

export default SettingsDialog