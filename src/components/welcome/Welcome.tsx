import { Button, TextField } from '@mui/material';
import { styled } from '@mui/system';
import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router';
import { AccountsDAO, StoredAccount } from '../../logic/db/app';
import { parseAccount } from '../../logic/utils/account';
import { Entry, LongText } from '../../styled/tables';
import CreateAccountDialog from '../create/CreateAccountDialog';

const Root = styled('div')(({ theme }) => ({
    textAlign: "center",
    padding: 16,
}))

export const Welcome: React.FC = () => {
    const [showCreateAccountDialog, setShowCreateAccountDialog] = useState(false)
    const [addressInput, setAddressInput] = useState("")
    const [addressError, setAddressError] = useState("")
    const [accountHistory, setAccountHistory] = useState<StoredAccount[]>([])
    const history = useHistory()
    const accountsDao = useMemo(() => new AccountsDAO(), [])

    const handleAddressInput = (address: string) => {
        setAddressInput(address)
        setAddressError("")
    }

    useEffect(() => {
        (async () => {
            setAccountHistory(await accountsDao.getAll())
        })()
    }, [setAccountHistory])

    const openAccount = async (address: string) => {
        const account = parseAccount(address)
        if (!account) {
            setAddressError("Invalid account!")
            return
        }
        accountsDao.add({
            ...account,
            timestamp: new Date().getTime()
        })
        history.push("/" + account.id)
    }

    return <Root>
        Welcome!<br /><br />
        <TextField label="Account address" onChange={(e) => handleAddressInput(e.target.value)} value={addressInput} error={!!addressError} helperText={addressError} fullWidth /><br />
        <Button onClick={() => openAccount(addressInput)}>Open</Button>
        <Button onClick={() => setShowCreateAccountDialog(true)}>Create</Button>
        {accountHistory.map((account) => {
            return (
                <Entry onClick={() => openAccount(account.id)}>
                    <LongText>{account.id}</LongText>
                </Entry>
            )
        })}
        <CreateAccountDialog open={showCreateAccountDialog} handleClose={() => setShowCreateAccountDialog(false)}/>
    </Root>
}

export default Welcome