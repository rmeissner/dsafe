import { Typography } from "@mui/material"
import { useCallback, useMemo, useState } from "react";
import { useAccount } from "../Dashboard"
import makeBlockie from 'ethereum-blockies-base64';
import { styled } from "@mui/system";
import { Group, Row } from "../../../styled/tables";
import { shortAddress } from "../../../logic/utils/address";
import { Settings } from "@mui/icons-material";
import SettingsDialog from "../../settings/SettingsDialog";
import { useTransactionRepo } from "../../provider/TransactionRepositoryProvider";

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

export const AccountHeader: React.FC = () => {
    const [showSettings, setShowSettings] = useState<boolean>(false)
    const account = useAccount()
    const iconSrc = useMemo(() => makeBlockie(account.address), [account]);
    const txRepo = useTransactionRepo()


    const reindex = useCallback(async () => {
        txRepo.reindex()
      }, [txRepo])

    return <Row sx={{
        paddingX: '16px',
        width: `calc(100% - 32px)`,
        justifyContent: 'space-between',
        textAlign: 'left',
        alignItems: 'center'
    }}>
        <StyledImg src={iconSrc} size="md" />
        <Group sx={{ paddingX: '8px', textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'Monospace' }} >{shortAddress(account.address)}</Typography>
            Chain {account.chainId}
        </Group>
        <Settings onClick={() => setShowSettings(true)} />
        <SettingsDialog open={showSettings} handleClose={() => setShowSettings(false)} reindex={reindex} />
    </Row>
}

export default AccountHeader