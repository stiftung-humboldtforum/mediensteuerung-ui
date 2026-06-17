import { observable } from 'mobx'
import { Instance, types } from 'mobx-state-tree'
import { ws } from '../RootStore'
import { genericStatus } from './Common'
import { TagModel } from './Tag'
import { DeviceModel } from './Device'

const locationData = {
  id: types.number,
  name: types.string,
  description: types.maybeNull(types.string),
}

export const LocationDataModel = types.model('LocationData').props({
  ...locationData,
  custom_fields: types.model({
    knx_switch_group_addresses: types.maybeNull(types.string),
  }),
  parent: types.maybeNull(types.model(locationData)),
  tags: types.array(types.reference(TagModel)),
  devices: types.optional(
    types.array(types.late(() => types.reference(DeviceModel))),
    [],
  ),
})

export const LocationModel = types
  .model({
    id: types.identifier,
    data: LocationDataModel,
    status: types.optional(
      types.model({
        ...genericStatus,
        knx_state: types.optional(
          types.union(types.literal(-1), types.literal(0), types.literal(1)),
          -1,
        ),
      }),
      {},
    ),
  })
  .actions(store => ({
    fetch() {
      if (!store.status.is_attached) {
        ws.send({
          target: 'location',
          command: 'fetch',
          data: { id: store.id },
        })
      }
    },
  }))
  .views(store => {
    const devices = observable(store.data.devices)
    return {
      get name() {
        return store.data.description || store.data.name
      },
      get hasError() {
        const errors_set = new Set()
        return devices
          .filter(({ hasError }) => !!hasError)
          .map(({ hasError }) => hasError)
          .reduce((acc: Set<string>, val: Array<string>) => {
            val?.forEach(acc.add.bind(errors_set))
            return acc
          }, errors_set)
      },
      get capabilities() {
        const capabilities_set = new Set()
        return Array.from(
          new Set(
            devices
              .map(({ status }) => status.capabilities)
              .reduce((acc: Set<string>, val: Set<string>) => {
                val?.forEach(acc.add.bind(capabilities_set))
                return acc
              }, capabilities_set),
          ),
        )
      },
      get tags() {
        return store.data.tags
      },
    }
  })

export interface LocationData extends Instance<typeof LocationDataModel> {}
export interface Location extends Instance<typeof LocationModel> {}
