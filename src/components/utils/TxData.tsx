import React, { useState } from 'react'
import { Button, Link, Typography } from '@mui/material';
import { Group, LongText } from '../../styled/tables';

export interface Props {
    data: string
}

export const TxData: React.FC<Props> = ({ data }) => {
    const [collapsed, setCollapsed] = useState<boolean>(true)
    const decodePossible = data.length >= 10
    const canCollapse = data.length >= 42
    const displayData = canCollapse && collapsed ? data.slice(0, 24) + `...` : data
    return <Group sx={{ paddingBottom: "16px" }}>
        <LongText>{displayData} {canCollapse && (<Link onClick={() => { setCollapsed(!collapsed) }} sx={{ textDecoration: "none" }}>{collapsed ? "Expand" : "Collapse"}</Link>)}</LongText>
        {decodePossible && (<Button onClick={() => { window.open('https://rimeissner.dev/transaction-decoder/#/?data=' + data, '_blank'); }}>Decode</Button>)}
    </Group>
}

export default TxData