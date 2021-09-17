import React from 'react'
import { Route, Switch, HashRouter as Router } from "react-router-dom"
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Account from './account/Account';
import AppSettingsProvider from './provider/AppSettingsProvider';

const theme = createTheme({})

export const Root: React.FC = () => {
    return (
        <AppSettingsProvider>
            <ThemeProvider theme={theme}>
                <Router>
                    <Switch>
                        <Route path="/:account">
                            <Account />
                        </Route>
                        <Route path="/">
                        </Route>
                    </Switch>
                </Router>
            </ThemeProvider>
        </AppSettingsProvider>
    )
}

export default Root