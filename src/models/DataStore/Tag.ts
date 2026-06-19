import { Instance, types } from 'mobx-state-tree'
import { ws } from '../RootStore'
import { genericStatus } from './Common'
import { DeviceModel } from './Device'
import { observable } from 'mobx'

export const TagDataModel = types.model({
  id: types.number,
  name: types.string,
  description: types.string,
  color: types.string,
  devices: types.optional(
    types.array(types.late(() => types.reference(DeviceModel))),
    [],
  ),
})

export const TagModel = types
  .model({
    id: types.identifier,
    data: TagDataModel,
    status: types.optional(types.model(genericStatus), {}),
  })
  .views(store => {
    const devices = observable(store.data.devices)
    return {
      get name() {
        return store.data.name
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
    }
  })
  .actions(store => ({
    fetch() {
      if (!store.status.is_attached) {
        ws.send({
          target: 'tag',
          command: 'fetch',
          data: { id: Number(store.id) },
        })
      }
    },
  }))

export interface TagData extends Instance<typeof TagDataModel> {}
export interface Tag extends Instance<typeof TagModel> {}
