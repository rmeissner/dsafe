import React, { ReactElement } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { TransferDetails, TransferTx } from 'safe-indexer-ts'
import { styled } from '@mui/system';
import { Typography } from '@mui/material';
import { Entry, Group, Header, LongText } from '../../../../styled/tables';

export interface Props {
    transaction: TransferTx
}

const renderDetails = (details: TransferDetails): ReactElement => {
    let asset: string = ""
    let subjectTitle: string = ""
    let subject: string = ""
    switch (details.type) {
        case "ERC20":
            asset = "ERC20 - " + details.tokenAddress
            subjectTitle = "Value"
            subject = details.value
            break
        case "ERC721":
            asset = "ERC721 - " + details.tokenAddress
            subjectTitle = "ID"
            subject = details.tokenId
            break
        case "ETHER":
            asset = "Ether"
            subjectTitle = "Value"
            subject = details.value
            break
        default:
            break
    }
    return (<>
        <Header>Asset:</Header>
        <Entry>
            <Typography>{asset}</Typography>
        </Entry>
        <Header>{subjectTitle}</Header>
        <Entry>
            <Typography>{subject}</Typography>
        </Entry>
    </>)
}

export const TransferTxDetails: React.FC<Props> = ({ transaction }) => {
    return <Group>
        <Header>Date:</Header>
        <Entry>
            <Typography>{new Date(transaction.timestamp * 1000).toUTCString()}</Typography>
        </Entry>
        <Header>From:</Header>
        <Entry>
            <Typography>{transaction.sender}</Typography>
        </Entry>
        <Header>To:</Header>
        <Entry>
            <Typography>{transaction.receipient}</Typography>
        </Entry>
        {renderDetails(transaction.details)}
        <Header>Ethereum Transaction:</Header>
        <Entry>
            <Typography>{transaction.txHash}</Typography>
        </Entry>
    </Group>
}

export default TransferTxDetails