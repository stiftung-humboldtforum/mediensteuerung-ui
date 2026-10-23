import React, { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Startup from '../../containers/startup'
import { useStores } from '../../models'
import { SettingsSnapshotOut } from '../../models/SettingsStore'
import { Settings as SettingsIcon, ExpandMore } from '@mui/icons-material'
import DeviceMap from './deviceMap'
import DeviceOrder from './deviceOrder'
import useAxios from 'axios-hooks'
import Config from '../../config'
import { DialogBody } from '@blueprintjs/core'
import { LoadingButton } from '@mui/lab'

const Settings = ({ me, open, onClose }) => {
  const [{ data: config = [], loading, error }, refetch] = useAxios(
    {
      url: `https://${Config.API_HOST}/config/`,
    },
    { useCache: false },
  )
  const [, post] = useAxios(
    {
      url: `https://${Config.API_HOST}/config/`,
      method: 'POST',
    },
    { useCache: false, manual: true },
  )
  const { settingsStore } = useStores()
  const [state, setState] = useState({
    local: settingsStore,
    backend: config,
    isDirty: false,
  })

  useEffect(() => {
    if (config) {
      console.log(config)
      setState(prevState => ({
        ...prevState,
        backend: config.reduce((acc, val) => ({ ...acc, [val.slug]: val }), {}),
        isDirty: false,
      }))
    }
  }, [config])

  useEffect(() => {
    settingsStore.setProp('showErrors', state.local.showErrors)
  }, [settingsStore, state.local.showErrors])

  if (loading || error) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>Settings</DialogTitle>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogBody>
        <List>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                Appearance
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Personalize the UI
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <FormControlLabel
                    label="Show error notifications"
                    control={
                      <Switch
                        checked={state.local.showErrors}
                        onChange={({ target }) =>
                          setState({
                            ...state,
                            local: {
                              ...state.local,
                              showErrors: target.checked,
                            },
                          })
                        }
                      />
                    }
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
          {me?.is_superuser ? (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ width: '33%', flexShrink: 0 }}>
                  Backend
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  Device mapping and orchestration
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <Tooltip
                      title={
                        state.backend.group_by_tag_description?.description
                      }
                    >
                      <TextField
                        variant="standard"
                        label={state.backend.group_by_tag_description?.label}
                        value={state.backend.group_by_tag_description?.value}
                        onChange={event =>
                          setState({
                            ...state,
                            backend: {
                              ...state.backend,
                              group_by_tag_description: {
                                ...state.backend.group_by_tag_description,
                                value: event.target.value,
                              },
                            },
                            isDirty: true,
                          })
                        }
                        sx={{ flexGrow: 1 }}
                      />
                    </Tooltip>
                  </ListItem>
                  <DeviceMap
                    config={state.backend.device_map}
                    onChange={config => {
                      setState({
                        ...state,
                        backend: {
                          ...state.backend,
                          device_map: config,
                        },
                        isDirty: true,
                      })
                    }}
                  />
                  {/*<DeviceOrder />*/}
                </List>
              </AccordionDetails>
            </Accordion>
          ) : null}
        </List>
      </DialogBody>
      <DialogActions>
        <LoadingButton
          color="success"
          disabled={!state.isDirty}
          onClick={() => console.log({ data: Object.values(state.backend) })}
          size="large"
        >
          Apply
        </LoadingButton>
        <LoadingButton size="large" onClick={onClose}>
          Cancel
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default Settings
