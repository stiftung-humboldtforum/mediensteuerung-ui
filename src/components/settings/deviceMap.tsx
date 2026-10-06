import { Save, Delete, Edit, Add, ExpandMore } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Dialog,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
} from '@mui/material'
import { values } from 'mobx'
import React, { useEffect, useMemo, useState } from 'react'
import { useStores } from '../../models'

const Rule = ({ index, rule, onSave, onDelete }) => {
  const [state, setState] = useState({
    fieldName: null,
    value: null,
    isDirty: false,
  })

  const isValid = useMemo(() => !!state.fieldName && !!state.value, [state])

  useEffect(() => {
    try {
      const [[fieldName, value]] = Object.entries(rule)
      setState({ fieldName, value, isDirty: false })
    } catch {}
  }, [rule])

  return (
    <ListItem>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row',
          gap: '10px',
        }}
      >
        <TextField
          variant="standard"
          label="Field Name"
          value={state.fieldName}
          onChange={event =>
            setState({ ...state, fieldName: event.target.value, isDirty: true })
          }
          color={isValid ? 'primary' : 'error'}
          sx={{ flexGrow: 1 }}
        />
        <TextField
          variant="standard"
          label="Value"
          value={state.value}
          onChange={event =>
            setState({ ...state, value: event.target.value, isDirty: true })
          }
          color={isValid ? 'primary' : 'error'}
          sx={{ flexGrow: 1 }}
        />
      </Box>
      <ListItemIcon>
        <IconButton onClick={() => onDelete(index)}>
          <Delete />
        </IconButton>
        <IconButton
          disabled={!state.isDirty || !isValid}
          color={isValid ? 'success' : 'error'}
          onClick={() => {
            onSave(index, { [state.fieldName]: state.value })
            setState({ ...state, isDirty: false })
          }}
        >
          <Save />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  )
}

const DeviceRules = ({
  className,
  rules = [],
  onSave = rules => null,
  numDevicesPerClass = {},
  ...rest
}) => {
  const [state, setState] = useState(rules)

  useEffect(() => {
    setState(rules)
  }, [rules])

  return (
    <Dialog open={rest.open} onClose={rest.onClose} fullWidth>
      <DialogTitle>{className}</DialogTitle>
      <DialogContentText></DialogContentText>
      <List>
        {!state.length && (
          <ListItem>
            <ListItemText primary="No rules yet" sx={{ textAlign: 'center' }} />
          </ListItem>
        )}
        {state.map((rule, i) => (
          <Rule
            key={JSON.stringify(rule) + i.toString()}
            index={i}
            rule={rule}
            onSave={(index, rule) => {
              setState(prevRules => {
                prevRules.splice(index, 1, rule)
                return [...prevRules]
              })
              onSave(state)
            }}
            onDelete={index => {
              setState(prevRules => {
                prevRules.splice(index, 1)
                return [...prevRules]
              })
              onSave(state)
            }}
          />
        ))}
        <ListItem disableGutters>
          <ListItemButton onClick={() => setState([...state, {}])}>
            <ListItemText secondary={'add rule'} />
            <ListItemIcon>
              <Add />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      </List>
    </Dialog>
  )
}

interface DeviceMapConfig {
  label: string
  description: string
  slug: string
  value: Map<string, string>
}

const DeviceMap = ({
  config,
  onChange = config => null,
}: {
  config: DeviceMapConfig
  onChange: CallableFunction
}) => {
  const { dataStore } = useStores()

  const [state, setState] = useState({
    deviceMap: config.value,
    isDirty: false,
    className: null,
  })

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      deviceMap: config.value,
      isDirty: false,
    }))
  }, [config.value])

  const availableClasses = useMemo(
    () => Object.keys(config.value),
    [config.value],
  )

  const numDevicesPerClass = useMemo(() => {
    const devices = values(dataStore.devices)
    return availableClasses.reduce(
      (acc, val) => ({
        ...acc,
        [val]: (devices as any).filter(({ status }) => status.class === val)
          .length,
      }),
      {},
    )
  }, [availableClasses])

  useEffect(() => {
    if (state.isDirty) {
      onChange({
        ...config,
        device_map: state.deviceMap,
      })
    }
  }, [state])

  return (
    <ListItem sx={{ width: '100%' }} disablePadding>
      <Accordion sx={{ width: '100%' }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <ListItemText primary={config.label} secondary={config.description} />
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {availableClasses.map(className => (
              <Tooltip key={className} title="Edit rules">
                <ListItemButton
                  onClick={() => setState({ ...state, className })}
                >
                  <ListItemIcon>
                    <Edit />
                  </ListItemIcon>
                  <ListItemText
                    primary={className}
                    secondary={`${state.deviceMap[className]?.length} Rule${
                      state.deviceMap[className]?.length == 1 ? '' : 's'
                    }, Affecting ${numDevicesPerClass[className]} Device${
                      numDevicesPerClass[className] == 1 ? '' : 's'
                    }`}
                  ></ListItemText>
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
          {state.className ? (
            <DeviceRules
              className={state.className}
              open={!!state.className}
              onClose={() => setState({ ...state, className: null })}
              onSave={rules =>
                setState({
                  ...state,
                  deviceMap: {
                    ...config.value,
                    [state.className]: rules,
                  },
                  isDirty: true,
                })
              }
              onDelete={rules =>
                setState({
                  ...state,
                  deviceMap: { ...config.value, [state.className]: rules },
                  isDirty: true,
                })
              }
              rules={state.deviceMap[state.className]}
              numDevicesPerClass={numDevicesPerClass}
            />
          ) : null}
        </AccordionDetails>
      </Accordion>
    </ListItem>
  )
}

export default DeviceMap
