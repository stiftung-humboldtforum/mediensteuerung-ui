import { Instance, types } from 'mobx-state-tree'
import { TagModel } from './Tag'
import { LocationModel } from './Location'
export type { DeviceStatus } from './DeviceStatus'

const Ip = types.model({
  id: types.identifierNumber,
  dns_name: types.string,
  display: types.string,
  address: types.string,
  tags: types.array(types.reference(TagModel)),
  description: types.maybe(types.string),
})

const Interface = types.model({
  id: types.identifierNumber,
  name: types.maybeNull(types.string),
  mac_address: types.maybeNull(types.string),
})

const Role = types.model({
  id: types.identifierNumber,
  display: types.string,
  name: types.string,
})

const DeviceManufacturer = types.model({
  id: types.identifierNumber,
  name: types.string,
})

const DeviceType = types.model({
  id: types.identifierNumber,
  model: types.string,
  manufacturer: DeviceManufacturer,
})

export const DeviceDataModel = types.model({
  name: types.string,
  tags: types.optional(types.array(types.reference(TagModel)), []),
  location: types.maybe(types.reference(LocationModel)),
  primary_ip: Ip,
  serial: types.frozen(types.string),
  // geändert DA: Update Netbox
  // device_role: types.frozen(Role),
  role: types.frozen(Role),
  device_type: types.frozen(DeviceType),
  interfaces: types.optional(types.array(types.frozen(Interface)), []),
  power_ports: types.optional(
    types.array(
      types.model({
        id: types.number,
        name: types.string,
        label: types.string,
        link_peers: types.array(
          types.model({
            id: types.number,
            name: types.string,
            power_panel: types.maybe(
              types.model({
                id: types.number,
                name: types.string,
              }),
            ),
          }),
        ),
      }),
    ),
    [],
  ),
  powerfeeds: types.optional(types.array(types.model({})), []),
})

export interface DeviceData extends Instance<typeof DeviceDataModel> {}
