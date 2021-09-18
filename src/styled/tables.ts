import { Typography } from "@mui/material"
import { styled } from "@mui/system"

export const Group = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column'
}))

export const Header = styled('div')(({ theme }) => ({
    textAlign: 'start'
}))

export const Entry = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 16
}))

export const LongText = styled(Typography)(({ theme }) => ({
    width: '100%',
    textAlign: 'start',
    wordWrap: 'break-word'
}))