import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { Box, Button, ButtonClasses, ButtonGroup, Tooltip } from '@mui/material'
import { MosaicContext } from 'react-mosaic-component'
import { addToLargest } from '../../utils/mosaic'
import { Location } from '../../models/DataStore/Location'
import { observer } from 'mobx-react-lite'
import { Tag } from '../../models/DataStore/Tag'
import { Device as DeviceInstance } from '../../models/DataStore/Device'
import { StatusCell } from '../table/cells'
import { OpenInNew } from '@mui/icons-material'
import { styled } from 'styled-components'
import { KNXCell } from '../table/locationColumns'

const Device = observer<{ device: DeviceInstance }>(({ device }) => {
  const { mosaicActions } = useContext(MosaicContext)

  const buttonColor = (
    {
      [-1]: 'primary',
      0: 'error',
      1: 'warning',
      2: 'success',
    } as Partial<ButtonClasses>
  )[device.status.is_online]

  const open = useCallback(() => {
    mosaicActions.replaceWith(
      [],
      addToLargest({
        currentNode: mosaicActions.getRoot(),
        newNode: `device_${device.id}`,
      }),
    )
  }, [mosaicActions, device.id])

  return (
    <Box>
      <Button
        style={{ display: 'flex' }}
        startIcon={<StatusCell item={device} size="small" />}
        endIcon={<OpenInNew />}
        onClick={open}
        size="small"
        color={buttonColor}
      >
        {device.name} ({device.data.primary_ip.dns_name})
      </Button>
    </Box>
  )
})

const Devices = ({ devices }) => {
  return (
    <ButtonGroup orientation="vertical" variant="text">
      {devices.map((device, i) => (
        <Device key={`${i}_${device.name}`} device={device} />
      ))}
    </ButtonGroup>
  )
}

const Element = observer(({ element }: { element: Tag }) => {
  const { mosaicActions } = useContext(MosaicContext)
  useEffect(() => {
    element.fetch()
  }, [element])

  const open = useCallback(() => {
    mosaicActions.replaceWith(
      [],
      addToLargest({
        currentNode: mosaicActions.getRoot(),
        newNode: `tag_${element.id}`,
      }),
    )
  }, [mosaicActions, element.id])

  const buttonColor = (
    {
      [-1]: 'primary',
      0: 'error',
      1: 'warning',
      2: 'success',
    } as Partial<ButtonClasses>
  )[element.status.is_online]

  return (
    <Tooltip
      title={<Devices devices={element.data.devices} />}
      enterDelay={250}
      leaveDelay={250}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'common.black',
            '& .MuiTooltip-arrow': {
              color: 'common.black',
            },
          },
        },
      }}
      arrow
    >
      <Button
        sx={{ display: 'flex' }}
        startIcon={<StatusCell item={element} size="small" />}
        endIcon={<OpenInNew />}
        onClick={open}
        size="small"
        color={buttonColor}
      >
        {element.data.name}
      </Button>
    </Tooltip>
  )
})

export const RoomContainer = styled.div<{
  color: string
  width: number | string
}>(
  ({ color, width }) => `
    position: relative,
    width: ${width}px;
    min-width: fit-content;
    border-style: solid;
    border-color: ${color};
    border-width: 1px;
    padding: 1rem .5rem .5rem .5rem;
    position: relative;
    display: grid;
    justify-content: center;
`,
)

export default observer(
  ({ data: location, width }: { data: Location; width: number | string }) => {
    const { mosaicActions } = useContext(MosaicContext)
    const elements = useMemo(
      () =>
        location.data.tags.filter(
          ({ data }) => data.description === 'E-Nummer',
        ),
      [location],
    )
    const color = ['red', 'orange', 'green'][location.status.is_online]

    useEffect(() => {
      location.fetch()
    }, [location])

    const open = useCallback(() => {
      mosaicActions.replaceWith(
        [],
        addToLargest({
          currentNode: mosaicActions.getRoot(),
          newNode: `location_${location.id}`,
        }),
      )
    }, [mosaicActions, location.id])

    const buttonColor = (
      {
        [-1]: 'primary',
        0: 'error',
        1: 'warning',
        2: 'success',
      } as Partial<ButtonClasses>
    )[location.status.is_online]

    return (
      <RoomContainer color={color} width={width}>
        <div
          style={{
            position: 'absolute',
            maxWidth: '100%',
            top: 0,
            transform: 'translateY(-50%)',
            backgroundColor: '#121212',
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          }}
        >
          <Tooltip title={location.data.description}>
            <Button
              startIcon={<StatusCell item={location} size="small" />}
              onClick={open}
              endIcon={<OpenInNew />}
              color={buttonColor}
            >
              {location.data.name}
            </Button>
          </Tooltip>
        </div>
        <div style={{ fontSize: '.75rem', opacity: 0.75 }}>
          {location.data.description}
        </div>
        <ButtonGroup orientation="vertical" variant="text">
          {elements.map(element => (
            <Element key={element.id} element={element} />
          ))}
        </ButtonGroup>
      </RoomContainer>
    )
  },
)
