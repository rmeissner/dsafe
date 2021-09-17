import { Button, Dialog, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import React from 'react'
import { useAppSettings } from '../provider/AppSettingsProvider'

export interface Props {
    open: boolean,
    handleClose: () => void,
    reindex?: () => void,
}

export const SettingsDialog: React.FC<Props> = ({open, reindex, handleClose}) => {
    const { rpc, updateRpc } = useAppSettings()
    return <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
            <Typography variant="caption">App Settings</Typography><br />
            <TextField label="RPC" onChange={(e) => updateRpc(e.target.value)} value={rpc} /><br /><br />
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