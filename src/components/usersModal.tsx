import React, { memo, useMemo, useState, useCallback, useEffect } from 'react'
import useAxios from 'axios-hooks'

import {
  Box,
  Table,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  TextField,
  Switch,
  Stack,
  FormControlLabel,
  Button,
} from '@mui/material'
import { Delete, PersonAdd, Password, Save, Check } from '@mui/icons-material'

import Config from '../config'
import PasswordInput from './passwordInput'

interface UserProps {
  _id: string
  email: string
  is_superuser: boolean
}

const PasswordModal = ({
  user,
  open,
  onClose,
}: {
  user: UserProps
  open: boolean
  onClose: () => void
}) => {
  const [{ data, loading, error }, patch] = useAxios(
    {
      url: `https://${Config.API_HOST}/users/${user._id}`,
      method: 'patch',
    },
    { manual: true },
  )
  const [password, setPassword] = useState<string>('')
  const [password2, setPassword2] = useState<string>('')

  const invalid = useMemo(() => {
    return password !== password2 || password.length < 4
  }, [password, password2])

  const save = useCallback(() => {
    patch({ data: { ...user, password } })
  }, [user, password, patch])

  return (
    <Dialog open={open} onClose={onClose}>
      <List sx={{ '& .MuiFormControl-root': { width: '100%' } }}>
        <ListItem>
          <ListItemButton>
            <ListItemText>{user.email}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <PasswordInput
            label="New Password"
            onChange={({ target }) => setPassword(target.value)}
            loading={loading}
            error={error}
          />
        </ListItem>
        <ListItem>
          <PasswordInput
            label="Repeat new Password"
            onChange={({ target }) => setPassword2(target.value)}
            loading={loading}
            error={error}
          />
        </ListItem>
        <ListItem>
          <ListItemButton disabled={invalid} onClick={save}>
            <ListItemIcon>{data ? <Check /> : <Save />}</ListItemIcon>
            <ListItemText>{data ? 'Saved' : 'Save'}</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
    </Dialog>
  )
}

const AddUserModal = ({ open, onClose }) => {
  const [{ error, loading }, addUser] = useAxios(
    {
      url: `https://${Config.API_HOST}/auth/register`,
      method: 'post',
    },
    { manual: true },
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSuperuser, setIsSuperuser] = useState(false)

  const save = useCallback(() => {
    addUser({ data: { email, password, is_superuser: isSuperuser } }).then(
      () => {
        onClose()
      },
    )
  }, [onClose, addUser, email, password, isSuperuser])

  return (
    <Dialog open={open} onClose={onClose}>
      <Stack sx={{ p: 2 }} spacing={2}>
        <TextField
          required
          label="Email of new user"
          error={!!error}
          disabled={loading}
          onChange={({ target }) => setEmail(target.value)}
        />
        <PasswordInput
          label="Password of new user"
          onChange={({ target }) => setPassword(target.value)}
          error={!!error}
          loading={loading}
        />
        <FormControlLabel
          control={
            <Switch
              checked={isSuperuser}
              onChange={() => setIsSuperuser(!isSuperuser)}
            />
          }
          label="Admin"
        />
        <Button
          disabled={loading}
          size="large"
          startIcon={<Save />}
          onClick={() => save()}
        >
          Save
        </Button>
      </Stack>
    </Dialog>
  )
}

interface UserRowProps {
  user: UserProps
  refetch: () => void
}

const UserRow = memo<UserRowProps>(({ user, refetch }) => {
  const [, patch] = useAxios(
    {
      url: `https://${Config.API_HOST}/users/${user._id}`,
      method: 'patch',
    },
    { manual: true },
  )
  const [, _delete] = useAxios(
    {
      url: `https://${Config.API_HOST}/users/${user._id}`,
      method: 'delete',
    },
    { manual: true },
  )
  const [userState, setUserState] = useState<UserProps>(user)
  const [pwModal, setPwModal] = useState(false)
  const [needsCommit, setNeedsCommit] = useState(false)

  useEffect(() => {
    if (needsCommit) {
      patch({ data: userState }).then(() => {
        setNeedsCommit(false)
        refetch()
      })
    }
  }, [refetch, patch, userState, needsCommit])

  return (
    <TableRow key={user.email}>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Switch
          checked={userState.is_superuser}
          onChange={() => {
            setUserState((prevState: UserProps) => ({
              ...prevState,
              is_superuser: !prevState.is_superuser,
            }))
            setNeedsCommit(true)
          }}
        />
      </TableCell>
      <TableCell>
        <IconButton onClick={() => setPwModal(true)}>
          <Password />
        </IconButton>
      </TableCell>
      <TableCell>
        <IconButton
          disabled={userState.is_superuser}
          onClick={() =>
            !userState.is_superuser && _delete().then(() => refetch())
          }
        >
          <Delete />
        </IconButton>
      </TableCell>
      <PasswordModal
        user={userState}
        open={pwModal}
        onClose={() => setPwModal(false)}
      />
    </TableRow>
  )
})

const UsersModal = ({ open, onClose }) => {
  const [{ data: users = [] }, refetch] = useAxios(
    {
      url: `https://${Config.API_HOST}/users/`,
    },
    { useCache: false },
  )
  const [needsFetch, setNeedsFetch] = useState(false)
  const [addUserModal, setAddUserModal] = useState(false)

  useEffect(() => {
    if (needsFetch) {
      refetch().then(() => setNeedsFetch(false))
    }
  }, [refetch, needsFetch])

  const _onClose = () => {
    setNeedsFetch(true)
    onClose()
  }

  return (
    <Dialog open={open} onClose={_onClose} fullWidth>
      <Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Admin</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .filter(({ email }) => !email.startsWith('system'))
                .map((user: UserProps) => (
                  <UserRow key={user.email} user={user} refetch={refetch} />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <List>
          <ListItem>
            <ListItemText>
              <IconButton onClick={() => setAddUserModal(true)}>
                <PersonAdd />
              </IconButton>
            </ListItemText>
          </ListItem>
        </List>
      </Box>
      <AddUserModal
        open={addUserModal}
        onClose={() => {
          setAddUserModal(false)
          setNeedsFetch(true)
        }}
      />
    </Dialog>
  )
}

export default UsersModal
