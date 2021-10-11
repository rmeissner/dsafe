import { IconButton, Typography } from "@mui/material"
import { useMemo } from "react";
import makeBlockie from 'ethereum-blockies-base64';
import { styled } from "@mui/system";
import { ContentCopy } from "@mui/icons-material";
import { Row } from "../../styled/tables";
import { shortAddress } from "../../logic/utils/address";
import { copyToClipboard, useCopyAddress } from "./media";

const theme = {
    identicon: {
        size: {
            xs: '10px',
            sm: '16px',
            md: '32px',
            lg: '40px',
            xl: '48px',
            xxl: '60px',
        },
    },
}

type Theme = typeof theme;
type ThemeIdenticonSize = keyof Theme['identicon']['size'];

const StyledImg = styled('img')<{ size: ThemeIdenticonSize }>(({ theme: Theme, size }) => ({
    height: theme.identicon.size[size],
    width: theme.identicon.size[size],
    borderRadius: '50%'
}));

export const AddressInfo: React.FC<{ address: string, onClick?: (address: string) => void  }> = ({ address, onClick }) => {
    const iconSrc = useMemo(() => makeBlockie(address), [address]);
    const copyAddress = useCopyAddress(address)
    return <Row sx={{
        width: `calc(100% - 32px)`,
        textAlign: 'left',
        alignItems: 'center'
    }}>
        <StyledImg src={iconSrc} size="md" onClick={() => onClick?.(address) } />
        <Typography sx={{ fontFamily: 'Monospace', paddingX: '8px' }} onClick={() => onClick?.(address) } >{shortAddress(address)}</Typography>
        <IconButton color="default" component="span" onClick={() => copyAddress() }>
            <ContentCopy fontSize="small" />
        </IconButton>
    </Row>
}

export default AddressInfo