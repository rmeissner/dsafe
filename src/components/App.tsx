import React from 'react'
import { Route, Switch, HashRouter as Router } from "react-router-dom"
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Dashboard from './account/Dashboard';
import AppSettingsProvider from './provider/AppSettingsProvider';
import Welcome from './welcome/Welcome';
import RelayRepositoryProvider from './provider/RelayRepositoryProvider';
import FactoryRepositoryProvider from './provider/FactoryRepositoryProvider';

const theme = createTheme({})

export const Root: React.FC = () => {
    return (
        <AppSettingsProvider>
            <FactoryRepositoryProvider>
                <RelayRepositoryProvider>
                    <ThemeProvider theme={theme}>
                        <Router>
                            <Switch>
                                <Route path="/:account">
                                    <Dashboard />
                                </Route>
                                <Route path="/">
                                    <Welcome />
                                </Route>
                            </Switch>
                        </Router>
                    </ThemeProvider>
                </RelayRepositoryProvider>
            </FactoryRepositoryProvider>
        </AppSettingsProvider>
    )
}

export default Root