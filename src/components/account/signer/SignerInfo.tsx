import { Button } from "@mui/material";
import { styled } from "@mui/system";
import { useAppSettings } from "../../provider/AppSettingsProvider";
import { useAccount } from "../Dashboard";

const Root = styled('div')(({ theme }) => ({
    textAlign: "center"
}))

export const SignerInfo: React.FC = () => {
    const { chainId } = useAccount()
    const { signer, safeSigner } = useAppSettings()
    return <Root>
        <hr />
        { !!signer ? 
            <Button onClick={() => safeSigner.disconnect() }>Disconnect</Button>  : 
            <Button onClick={() => safeSigner.connect(chainId) }>Connect</Button> 
        }
    </Root>
}

export default SignerInfo