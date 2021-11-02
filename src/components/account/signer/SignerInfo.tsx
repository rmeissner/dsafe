import { Button } from "@mui/material";
import { styled } from "@mui/system";
import { useAppSettings } from "../../provider/AppSettingsProvider";
import { useAccount } from "../Dashboard";

const Root = styled('div')(({ theme }) => ({
    textAlign: "center"
}))

export const SignerInfo: React.FC = () => {
    const { chainId } = useAccount()
    const { status, connect } = useAppSettings()
    const { connected } = status()

    return <Root>
        <hr />
        { connected ? "Connected" : <Button onClick={() => connect(chainId) }>Connect</Button> }
    </Root>
}

export default SignerInfo