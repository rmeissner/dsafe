import { Button, Dialog, DialogContent, DialogTitle, Switch, TextField, Typography } from '@mui/material'
import React from 'react'
import { useAppSettings } from '../provider/AppSettingsProvider'

export interface Props {
    open: boolean,
    handleClose: () => void,
    reindex?: () => void,
}

export const SettingsDialog: React.FC<Props> = ({open, reindex, handleClose}) => {
    const { useCustomRpc, toggleCustomRpc, customRpc, updateCustomRpc } = useAppSettings()
    return <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
            <Typography variant="caption">App Settings</Typography><br />
            Use custom prc endpoint <Switch checked={useCustomRpc} onChange={(_, checked) => toggleCustomRpc(checked) } /><br /><br />
            <TextField label="RPC" onChange={(e) => updateCustomRpc(e.target.value)} value={customRpc} fullWidth /><br /><br />
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