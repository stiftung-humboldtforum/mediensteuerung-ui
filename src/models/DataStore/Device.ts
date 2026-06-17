import { Instance, SnapshotIn, types } from 'mobx-state-tree'
import { Lambda, entries, onBecomeObserved } from 'mobx'
import { DeviceDataModel } from './DeviceData'
import { DeviceStatusModel } from './DeviceStatus'
import { ws } from '../RootStore'
export type { DeviceData } from './DeviceData'
export type { DeviceStatus } from './DeviceStatus'

export const DeviceModel = types
  .model({
    id: types.identifier,
    data: DeviceDataModel,
    status: types.optional(DeviceStatusModel, {}),
  })
  .views(store => ({
    get name() {
      return (
        store.data.primary_ip?.description ||
        store.data.primary_ip?.dns_name ||
        store.data.name
      )
    },
  }))
  .views(store => ({
    get hasError() {
      return (
        store.status.errors &&
        new Set(
          entries(store.status.errors)
            .filter(([, value]) => value !== null && value !== 'ok')
            .map(([key, _]) => `${store.name} (${key})`),
        )
      )
    },
    get capabilities() {
      return store.status.capabilities
    },
    get tags() {
      return store.data.tags
    },
  }))
  .actions(store => ({
    fetch() {
      if (!store.status.is_attached) {
        ws.send({
          target: 'device',
          command: 'fetch',
          data: { id: store.id },
        })
      }
    },
  }))
  .actions(store => {
    let becomeObsDisposer: Lambda
    return {
      beforeAll() {
        if (!store.status.is_attached) {
          becomeObsDisposer = onBecomeObserved(store, 'status', store.fetch)
        }
      },
      beforeDestroy() {
        if (becomeObsDisposer) {
          becomeObsDisposer()
          becomeObsDisposer = undefined
        }
      },
    }
  })

export interface Device extends Instance<typeof DeviceModel> {}
export interface DeviceSnapshotIn extends SnapshotIn<typeof DeviceModel> {}
