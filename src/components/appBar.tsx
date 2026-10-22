import React, { useCallback, useContext, useMemo, useState } from 'react'

import { getLeaves } from 'react-mosaic-component'

import {
  Drawer,
  AppBar as MuiAppBar,
  Toolbar,
  Box,
  Button,
  ButtonGroup,
  IconButton,
} from '@mui/material'
import { Menu, Logout } from '@mui/icons-material'

import { AuthenticationContext } from '../context'
import { addToLargest } from '../utils/mosaic'
import DrawerMenu from './drawerMenu'
import Clock from './clock'
import Spinner from './spinner'

const AppBar = ({ node, setNode }) => {
  const { logout } = useContext(AuthenticationContext)
  const [drawer, setDrawer] = useState(false)

  const leaves = useMemo(() => getLeaves(node), [node])

  const makeButtonProps = useCallback(
    ({ label, key }) => {
      return {
        label,
        key,
        disabled: leaves.includes(key),
        onClick: () =>
          setNode(addToLargest({ currentNode: node, newNode: key })),
      }
    },
    [leaves, node, setNode],
  )

  const toolbarButtons = useMemo(() => {
    return [
      {
        label: 'Rooms',
        key: 'rooms',
      },
      {
        label: 'Calendar',
        key: 'calendar',
      },
      {
        label: 'Locations',
        key: 'locations',
      },
      {
        label: 'Tags',
        key: 'tags',
      },
      {
        label: 'Devices',
        key: 'devices',
      },
    ].map(makeButtonProps)
  }, [makeButtonProps])

  const drawerButtons = useMemo(() => {
    return [
      ...toolbarButtons,
      makeButtonProps({
        label: 'KNX Events',
        key: 'knx_events',
      }),
      makeButtonProps({
        label: 'Errors',
        key: 'errors',
      }),
    ]
  }, [toolbarButtons, makeButtonProps])

  return (
    <>
      <MuiAppBar position="static">
        <Toolbar variant="dense">
          <Box sx={{ mr: 2 }}>
            <IconButton onClick={() => setDrawer(true)}>
              <Menu />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <ButtonGroup>
              {toolbarButtons.map(({ disabled, key, label, onClick }) => (
                <Button key={key} disabled={disabled} onClick={onClick}>
                  {label}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Clock />
          <Box sx={{ flexGrow: 0.25 }} />
          <Box>
            <IconButton onClick={logout}>
              <Logout />
            </IconButton>
          </Box>
          <Box>
            <Spinner />
          </Box>
        </Toolbar>
      </MuiAppBar>
      <Drawer open={drawer} onClose={() => setDrawer(false)}>
        <DrawerMenu
          toolbarButtons={drawerButtons}
          onClose={() => setDrawer(false)}
        />
      </Drawer>
    </>
  )
}
export default AppBar
