import { Autocomplete, Button, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { useState, useMemo, useEffect } from 'react';
import { AppUrlsDAO } from '../../../logic/db/app';
import { Group, Row } from '../../../styled/tables';
import AppWindow from './AppWindow';

const Root = styled(Group)(({ theme }) => ({
  textAlign: "center",
  width: "100vw",
  height: "100vh"
}))

function Apps() {
  const appUrlsDao = useMemo(() => new AppUrlsDAO(), [])
  const [appUrl, setAppUrl] = useState("https://apps.gnosis-safe.io/wallet-connect")
  const [appUrlError, setAppUrlError] = useState("")
  const [appUrlInput, setAppUrlInput] = useState(appUrl)
  const [appUrlsHistory, setAppUrlsHistory] = useState<string[]>([])

  useEffect(() => {
    (async () => {
      setAppUrlsHistory((await appUrlsDao.getAll()).map(appUrl => appUrl.id))
    })()
  }, [setAppUrlsHistory, appUrl])

  const handleInputChange = (input: string) => {
    setAppUrlInput(input)
    setAppUrlError("")
  }

  const openAppUrl = async (appUrl: string) => {
    const cleanUrl = appUrl.trim()
    if (cleanUrl.length === 0) {
      setAppUrlError("Empty App Url is not allowed")
      return
    }
    await appUrlsDao.add({ id: cleanUrl, timestamp: new Date().getTime() })
    setAppUrl(cleanUrl)
  }
  return (
    <Root>
      <Row>
        <Autocomplete
          id="free-solo-demo"
          freeSolo
          fullWidth
          options={appUrlsHistory}
          onChange={(e, newValue) => handleInputChange(newValue || "")}
          renderInput={(params) =>
            <TextField
              {...params}
              label="App Url"
              margin="normal"
              value={appUrlInput}
              error={!!appUrlError}
              helperText={appUrlError}
              onChange={(e) => handleInputChange(e.target.value)}
            />
          }
        />
        <Button onClick={() => { openAppUrl(appUrlInput) }}>GO</Button>
      </Row>
      <AppWindow appUrl={appUrl} />
    </Root>
  );
}

export default Apps;
