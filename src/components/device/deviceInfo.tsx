import React from 'react'
import styled from 'styled-components'
import FlashOn from '@mui/icons-material/FlashOn'
import InputIcon from '@mui/icons-material/Input'
import { Tags } from '../tag'
import Errors from './components/errors'
import Lamps from './components/lamps'
import Interfaces from './components/interfaces'
import PDU from './components/pdu'
import { Temperatures, Fans } from './components/sensors'
import Powerfeeds from './components/powerfeeds'
import { useStores } from '../../models'
import { observer } from 'mobx-react-lite'
import { Output } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import { secondsToDhms } from '../../utils/time'

const DeviceInfoContainer = styled.div`
  display: grid;
  grid-template-columns: max-content max-content;
  column-gap: 1rem;
  row-gap: 0.5rem;
`

const DeviceInfoLabel = styled.div`
  display: inline-flex;
  justify-content: right;
  align-items: center;
`

const Status = styled.div`
  display: grid;
  grid-template-columns: max-content max-content;
  gap: 0.5rem;
`

const DeviceInfo = ({ id }) => {
  const { dataStore } = useStores()
  const device = dataStore.getDevice(id)
  return (
    <DeviceInfoContainer>
      <DeviceInfoLabel>State:</DeviceInfoLabel>
      <div>{['Off', '...', 'On'][device.status.is_online]}</div>
      <DeviceInfoLabel>Device Role:</DeviceInfoLabel>
      <div>{device.data.role?.display}</div>
      <DeviceInfoLabel>Device Type:</DeviceInfoLabel>
      <div>
        {device.data.device_type?.manufacturer.name}{' '}
        {device.data.device_type?.model}
      </div>
      <DeviceInfoLabel>Serial:</DeviceInfoLabel>
      <div>{device.data.serial}</div>
      <DeviceInfoLabel>Primary IP:</DeviceInfoLabel>
      <div>{device.data.primary_ip?.address}</div>
      <DeviceInfoLabel>DNS Name:</DeviceInfoLabel>
      <div>{device.data.primary_ip?.dns_name}</div>
      <DeviceInfoLabel>Location:</DeviceInfoLabel>
      <div>{device.data.location?.data.name}</div>
      <DeviceInfoLabel>Interfaces:</DeviceInfoLabel>
      <Interfaces interfaces={device.data.interfaces} />
      {device.data.primary_ip?.tags ? (
        <>
          <DeviceInfoLabel>Tags:</DeviceInfoLabel>
          <Tags tags={device.data.primary_ip.tags} />
        </>
      ) : null}
      {device.data.power_ports?.length > 0 ? (
        <>
          <DeviceInfoLabel>Power:</DeviceInfoLabel>
          <PDU name={device.name} power_ports={device.data.power_ports} />
        </>
      ) : null}
      {device.status.is_online === 2 ? (
        <>
          <DeviceInfoLabel>Status:</DeviceInfoLabel>
          <Status>
            {device.status.uptime !== null ? (
              <Tooltip title="Uptime">
                <>
                  <FlashOn />
                  {secondsToDhms(device.status.uptime)}
                </>
              </Tooltip>
            ) : null}
            {device.status.display ? (
              <>
                <Output />
                {device.status.display}
              </>
            ) : null}
            {device.status.ires ? (
              <>
                <InputIcon />
                <div>{device.status.ires}</div>
              </>
            ) : null}
            {device.status.errors ? (
              <Errors errors={device.status.errors} />
            ) : null}
            {device.status.temperatures !== null ? (
              <Temperatures device={device} />
            ) : null}
            {device.status.fans !== null ? <Fans device={device} /> : null}
            {device.status.lamps?.length > 0 ? (
              <Lamps lamps={device.status.lamps} />
            ) : null}
            {device.status.powerfeeds?.length ? (
              <Powerfeeds
                id={device.id}
                device_type={device.data.device_type}
                powerfeeds={device.status.powerfeeds}
              />
            ) : null}
          </Status>
        </>
      ) : null}
    </DeviceInfoContainer>
  )
}

export default observer(DeviceInfo)
