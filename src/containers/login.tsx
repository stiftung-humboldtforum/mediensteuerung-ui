import React, { useEffect, useState } from 'react'

import {
  Box,
  Card,
  Stack,
  FormGroup,
  TextField,
  ListItem,
  Button,
} from '@mui/material'
import { Login as LoginIcon } from '@mui/icons-material'
import PasswordInput from '../components/passwordInput'

const Login = ({ login, loading, error }) => {
  const [username, setUsername] = useState<string>()
  const [password, setPassword] = useState<string>()

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent): void => {
      if (event.key === 'Enter') {
        login({ username, password })
      }
    }
    window.addEventListener('keydown', keyHandler)
    return () => window.removeEventListener('keydown', keyHandler)
  }, [username, password, login])

  return (
    <div
      style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
          '& .MuiFormControl-root': { m: 1, width: '25ch' },
          '& .MuiFormControlLabel-root': { alignSelf: 'center' },
          '& img': { m: 2 },
        }}
        style={{ alignSelf: 'center' }}
      >
        <Card style={{ alignSelf: 'center' }}>
          <Stack spacing={2}>
            <ListItem>
              <img src="/logo.svg" width="100%" alt="Logo" />
            </ListItem>
            <FormGroup>
              <TextField
                required
                label="Email"
                error={error}
                disabled={loading}
                onChange={({ target }) => setUsername(target.value)}
              />
              <PasswordInput
                onChange={({ target }) => setPassword(target.value)}
                error={error}
                loading={loading}
              />
              <Button
                loading={loading}
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => login({ username, password })}
              >
                Login
              </Button>
            </FormGroup>
          </Stack>
        </Card>
      </Box>
    </div>
  )
}

export default Login
