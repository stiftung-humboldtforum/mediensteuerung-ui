import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  createFilterOptions,
  FormGroup,
  InputAdornment,
  TextField,
} from '@mui/material'
import { toJS, values } from 'mobx'
import { useStores } from '../../models'
import { Add, Devices, Label, Room } from '@mui/icons-material'
import { ItemType } from '../../hooks/useActions'
import { Device } from '../../models/DataStore'
import { Tag, TagData } from '../../models/DataStore/Tag'
import { Option, OptionDescription, OptionLabel } from '../autocomplete'
import { LocationData } from '../../models/DataStore/Location'
import { DeviceData } from '../../models/DataStore/DeviceData'
import Config from '../../config'

export const OptionIcon = ({ type }: { type: ItemType }) => {
  switch (type) {
    case ItemType.location:
      return <Room />
    case ItemType.tag:
      return <Label />
    case ItemType.device:
      return <Devices />
    default:
      return <Add />
  }
}

const Items = ({
  value,
  onChange,
}: {
  value: {
    type: ItemType
    label: string
    description: string
    id: number
    data: LocationData | TagData | DeviceData
  }
  onChange: (
    arg0: SyntheticEvent<Element, Event>,
    arg1: any,
    arg2?: AutocompleteChangeReason,
    arg3?: AutocompleteChangeDetails<any>,
  ) => void
}) => {
  const { dataStore } = useStores()
  const filterOptions = createFilterOptions({
    stringify: (option: any) =>
      [option.type, option.label, option.data.description].join(' '),
  })
  const [options, setOptions] = useState<
    Array<{ type: ItemType; id: number; label: string; data: any }>
  >([])

  const getOptions = useCallback(() => {
    return [
      ...values(dataStore.locations)
        .filter((item: any) => !!item.capabilities.length)
        .map((location: any) => ({
          type: ItemType.location,
          label: location.name,
          description: location.data.name,
          id: location.id,
          data: location.data,
          actions: {
            start: location.capabilities.includes(
              Config.defaultEventActions.start,
            )
              ? Config.defaultEventActions.start
              : '',
            end: location.capabilities.includes(Config.defaultEventActions.end)
              ? Config.defaultEventActions.end
              : '',
          },
        })),
      ...values(dataStore.tags)
        .filter((item: any) => !!item.capabilities.length)
        .map((tag: Tag) => ({
          type: ItemType.tag,
          label: tag.name,
          description: tag.data.description,
          id: tag.id,
          data: tag.data,
          actions: {
            start: tag.capabilities.includes(Config.defaultEventActions.start)
              ? Config.defaultEventActions.start
              : '',
            end: tag.capabilities.includes(Config.defaultEventActions.end)
              ? Config.defaultEventActions.end
              : '',
          },
        })),
      ...values(dataStore.devices)
        .filter((item: any) => !!item.capabilities.length)
        .map((device: Device) => ({
          type: ItemType.device,
          label: device.name,
          description: device.data.primary_ip?.dns_name,
          id: device.id,
          data: device.data,
          actions: {
            start: device.capabilities.includes(
              Config.defaultEventActions.start,
            )
              ? Config.defaultEventActions.start
              : '',
            end: device.capabilities.includes(Config.defaultEventActions.end)
              ? Config.defaultEventActions.end
              : '',
          },
        })),
    ].map(item => toJS(item))
  }, [dataStore])

  useEffect(() => {
    setOptions(getOptions())
  }, [getOptions])

  const getTextFieldLabel = useCallback((type: ItemType) => {
    switch (type) {
      case ItemType.location:
        return 'Location'
      case ItemType.tag:
        return 'Tag'
      case ItemType.device:
        return 'Device'
      default:
        return 'Location | Tag | Device'
    }
  }, [])

  return (
    <Autocomplete
      fullWidth
      value={value}
      onChange={onChange}
      options={options}
      groupBy={option => getTextFieldLabel(option.type)}
      openOnFocus
      renderInput={params => (
        <FormGroup
          row
          sx={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'end' }}
        >
          <TextField
            {...params}
            label={getTextFieldLabel(value?.type)}
            variant="standard"
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                startAdornment: (
                  <InputAdornment position="start">
                    <OptionIcon type={value?.type} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </FormGroup>
      )}
      getOptionLabel={option => `${option.label} (${option.description})`}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      renderOption={(props, option, state) => (
        <Option {...props} key={option.id}>
          <OptionLabel>
            <OptionIcon type={option.type} />
            {option.label}
          </OptionLabel>
          <OptionDescription>{option.description}</OptionDescription>
        </Option>
      )}
      filterOptions={filterOptions}
    />
  )
}

export default Items
