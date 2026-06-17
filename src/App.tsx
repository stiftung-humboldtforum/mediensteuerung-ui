import React from 'react'
import { closeSnackbar, SnackbarProvider } from 'notistack'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import 'moment/locale/de'

import './App.scss'

import { useInitialRootStore } from './models'
import useAuthentication from './hooks/useAuthentication'
import { AuthenticationContext } from './context'
import { Startup, Login, Main } from './containers'
import { IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'

const App = () => {
  const { rehydrated } = useInitialRootStore()
  const [{ token, isAuthenticated, loading, error }, { login, logout }] =
    useAuthentication()

  React.useEffect(() => {
    document.addEventListener('contextmenu', event => event.preventDefault())
  }, [])

  if (!rehydrated) {
    return <Startup fullScreen />
  }

  return (
    <div className="App bp6-dark">
      <SnackbarProvider
        maxSnack={5}
        preventDuplicate={true}
        autoHideDuration={30000}
        dense={true}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        style={{
          whiteSpace: 'break-spaces',
          hyphens: 'auto',
          display: 'flex',
          flexWrap: 'nowrap',
        }}
        action={snackbarId => (
          <IconButton onClick={() => closeSnackbar(snackbarId)}>
            <Close />
          </IconButton>
        )}
      >
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="de">
          <AuthenticationContext.Provider
            value={{ isAuthenticated, loading, error, token, logout }}
          >
            {isAuthenticated ? (
              <Main />
            ) : (
              <Login login={login} loading={loading} error={error} />
            )}
          </AuthenticationContext.Provider>
        </LocalizationProvider>
      </SnackbarProvider>
    </div>
  )
}

export default App
