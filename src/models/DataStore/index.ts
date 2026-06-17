import { Instance, SnapshotOut, SnapshotIn, types, applySnapshot } from 'mobx-state-tree'
import { api } from '../../services/api/'
import { withSetPropAction } from '../helpers/withSetPropAction'
import { DeviceModel } from './Device'
import { TagModel } from './Tag'
import { LocationModel } from './Location'
import { values } from 'mobx'
import { KNXEventsModel } from './KNX'

export type { Device, DeviceSnapshotIn } from './Device'

// geändert DA: async fetchData()
export const DataStoreModel = types
  .model('DataStore')
  .props({
    devices: types.map(DeviceModel),
    tags: types.map(TagModel),
    locations: types.map(LocationModel),
    knxEvents: types.optional(KNXEventsModel, { events: [], isLoading: true }),
    isLoading: types.optional(types.boolean, true),
    wsConnected: types.optional(types.boolean, false),
    devicesConnected: types.optional(types.boolean, false),
    tagsConnected: types.optional(types.boolean, false),
    locationsConnected: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .views(store => ({
    getDevice(target: number) {
      return store.devices.get(target.toString())
    },
  }))
  .actions(store => ({
    async fetchData() {
      store.setProp('isLoading', true)
      try {
        const response = await api.getData()
        const data = response as DataStoreSnapshotIn

        // Setze Maps einzeln - sicherer bei Netzwerkproblemen
        applySnapshot(store.devices, data.devices)
        applySnapshot(store.tags, data.tags)
        applySnapshot(store.locations, data.locations)

        store.setProp('isLoading', false)

        // Fetch device statuses
        values(store.devices).map(({ fetch }: any) => fetch())
        values(store.tags).map(({ fetch }: any) => fetch())
        values(store.locations).map(({ fetch }: any) => fetch())
      } catch (error) {
        console.error('fetchData() failed:', error)
        store.setProp('isLoading', false)
      }
    },
    commitDeviceEvent(event) {
      const device = store.devices.get(event.target)
      if (device) {
        if (event.type === 'capabilities') {
          device.status.is_attached = true
        }
        device.status[event.type] = event.value
      }
    },
    commitTagEvent(event) {
      const tag = store.tags.get(event.target)
      if (tag) {
        tag.status.is_attached = true
        tag.status[event.type] = event.value
      }
    },
    commitLocationEvent(event) {
      const location = store.locations.get(event.target)
      if (location) {
        location.status.is_attached = true
        location.status[event.type] = event.value
      }
    },
    commitKNXEvent(event) {
      store.knxEvents.events.unshift({
        ...event,
        id: event.id,
      })
    },
  }))

export interface DataStore extends Instance<typeof DataStoreModel> {}
export interface DataStoreSnapshotOut
  extends SnapshotOut<typeof DataStoreModel> {}
export interface DataStoreSnapshotIn
  extends SnapshotIn<typeof DataStoreModel> {}
