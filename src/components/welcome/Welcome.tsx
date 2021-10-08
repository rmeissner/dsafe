import { Button, TextField } from '@mui/material';
import { styled } from '@mui/system';
import React, { useState } from 'react'
import { useHistory } from 'react-router';
import { parseAccount } from '../../logic/utils/account';
import { Group, Row } from '../../styled/tables';

const Root = styled('div')(({ theme }) => ({
    textAlign: "center",
    padding: 16,
}))

export const Welcome: React.FC = () => {
    const [addressInput, setAddressInput] = useState("")
    const [addressError, setAddressError] = useState("")
    const history = useHistory()

    const handleAddressInput = (address: string) => {
        setAddressInput(address)
        setAddressError("")
    }

    const openAccount = (address: string) => {
        const account = parseAccount(address)
        if (!account) {
            setAddressError("Invalid account!")
            return
        }
        history.push("/" + account.id)
    }

    return <Root>
        Welcome!<br /><br />
        <TextField label="Account address" onChange={(e) => handleAddressInput(e.target.value)} value={addressInput} error={!!addressError} helperText={addressError} fullWidth /><br />
        <Button onClick={() => openAccount(addressInput)}>Open</Button>
    </Root>
}

export default Welcome