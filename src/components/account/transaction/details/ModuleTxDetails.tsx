import React from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { ModuleTx } from 'safe-indexer-ts'

export interface Props {
    transaction: ModuleTx
}

export const ModuleTxDetails: React.FC<Props> = ({ transaction }) => {
    return <>
        Status: {transaction.success ? (
            <>"Success " <CheckCircleIcon color="success" /></>
        ) : (
            <>"Error" <ErrorIcon color="error" /></>
        )}
    </>
}

export default ModuleTxDetails