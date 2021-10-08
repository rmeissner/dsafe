import { Autocomplete, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { useState, useMemo, useEffect } from 'react';
import { AppOption, defaultApps } from '../../../logic/apps/appList';
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
  const [appUrl, setAppUrl] = useState(defaultApps[0].url)
  const [appUrlError, setAppUrlError] = useState("")
  const [appUrlInput, setAppUrlInput] = useState(appUrl)
  const [appUrlsHistory, setAppUrlsHistory] = useState<AppOption[]>([])

  useEffect(() => {
    (async () => {
      const appHistory = (await appUrlsDao.getAll()).map(appUrl => {
        return {
          section: "History",
          title: appUrl.id,
          url: appUrl.id
        }
      })
      setAppUrlsHistory(defaultApps.concat(appHistory))
    })()
  }, [setAppUrlsHistory, appUrl])

  const handleInputChange = (input: string | AppOption | null, openUrl?: boolean) => {
    let newValue: string
    if (!input) {
      newValue = ""
    } else if (typeof input === "string") {
      newValue = input
    } else {
      newValue = input.url
    }
    setAppUrlInput(newValue)
    setAppUrlError("")

    if (openUrl) {
      openAppUrl(newValue)
    }
  }

  const openAppUrl = async (appUrl: string) => {
    let cleanUrl = appUrl.trim()
    if (cleanUrl.length === 0) {
      setAppUrlError("Empty App Url is not allowed")
      return
    }
    if (!cleanUrl.startsWith("http")) {
      cleanUrl = "https://" + cleanUrl
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
          defaultValue={defaultApps[0]}
          groupBy={(option) => option.section}
          getOptionLabel={(option: AppOption | string) => {
            if (typeof option === "string") return option
            return option.title
          }}
          onChange={(e, newValue) => handleInputChange(newValue, !!newValue && newValue !== "")}
          renderInput={(params) =>
            <TextField
              {...params}
              label="App Url"
              value={appUrlInput}
              error={!!appUrlError}
              helperText={appUrlError}
              variant="filled"
              onChange={(e) => handleInputChange(e.target.value)}
            />
          }
        />
      </Row>
      <AppWindow appUrl={appUrl} />
    </Root>
  );
}

export default Apps;
