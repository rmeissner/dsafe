import { Typography } from "@mui/material"
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "../Dashboard"
import makeBlockie from 'ethereum-blockies-base64';
import { styled } from "@mui/system";
import { Group, Row } from "../../../styled/tables";
import { shortAddress } from "../../../logic/utils/address";
import { Settings } from "@mui/icons-material";
import SettingsDialog from "../../settings/SettingsDialog";
import { useTransactionRepo } from "../../provider/TransactionRepositoryProvider";
import { useQueueRepo } from "../../provider/QueueRepositoryProvider";
import { Callback } from "safe-indexer-ts";
import { QueueRepositoryUpdates } from "../../../logic/account/QueueRepository";
import { useCopyAddress } from "../../utils/media";
import SafeInfoDialog from "../info/SafeInfoDialog";

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

export const AccountHeader: React.FC<{ expanded: boolean }> = ({ expanded }) => {
    const [showSettings, setShowSettings] = useState<boolean>(false)
    const [showInfo, setShowInfo] = useState<boolean>(false)
    const [queueSize, setQueueSize] = useState<number>(0)
    const account = useAccount()
    const iconSrc = useMemo(() => makeBlockie(account.address), [account]);
    const txRepo = useTransactionRepo()
    const queueRepo = useQueueRepo()

    // TODO: we have this logic in multiple places. Should be extracted
    const loadQueuedTxs = useCallback(async () => {
        try {
            setQueueSize((await queueRepo.getQueuedTxs()).length)
        } catch (e) {
            console.error(e)
        }
    }, [queueRepo, setQueueSize])

    useEffect(() => {
        const callback: Callback = {
            onNewInteractions: loadQueuedTxs
        }
        txRepo.registerCallback(callback)
        return () => txRepo.unregisterCallback(callback)
    }, [txRepo, loadQueuedTxs])

    useEffect(() => {
        const callback: QueueRepositoryUpdates = {
            onNewTx: loadQueuedTxs
        }
        queueRepo.registerCallback(callback)
        return () => queueRepo.unregisterCallback(callback)
    }, [queueRepo, loadQueuedTxs])

    useEffect(() => {
      loadQueuedTxs()
    }, [loadQueuedTxs])

    const reindex = useCallback(async () => {
        txRepo.reindex()
    }, [txRepo])

    const copyAddress = useCopyAddress(account.address)

    return <Row sx={{
        paddingX: '16px',
        width: `calc(100% - 32px)`,
        justifyContent: 'space-between',
        textAlign: 'left',
        alignItems: 'center'
    }}>
        <StyledImg src={iconSrc} size="md" onClick={() => setShowInfo(true)} />
        <Group sx={{ paddingX: '8px', textAlign: 'center' }} onClick={copyAddress} >
            <Typography sx={{ fontFamily: 'Monospace' }} >{shortAddress(account.address)}</Typography>
            Chain {account.chainId}
        </Group>
        {expanded ? (
            <Settings onClick={() => setShowSettings(true)} />
        ) : queueSize.toString()
        }
        <SettingsDialog open={showSettings} handleClose={() => setShowSettings(false)} reindex={reindex} />
        <SafeInfoDialog open={showInfo} handleClose={() => setShowInfo(false)} />
    </Row>
}

export default AccountHeader