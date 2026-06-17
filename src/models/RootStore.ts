import { Instance, onSnapshot, SnapshotOut, types } from 'mobx-state-tree'
import {
  AuthenticationStoreModel,
  AuthenticationStoreSnapshot,
} from './AuthenticationStore'
import { DataStoreModel } from './DataStore'
import { ErrorModel } from './ErrorStore'
import { EventsModel } from './EventStore'
import { SettingsModel } from './SettingsStore'
import Config from '../config'
import { APIWebSocket } from './WebSocket'
import { uniqueId } from '@blueprintjs/core/lib/esm/common/utils'
import { withSetPropAction } from './helpers/withSetPropAction'

export let ws: APIWebSocket

/**
 * A RootStore model.
 */
export const RootStoreModel = types
  .model('RootStore')
  .props({
    isLoading: types.optional(types.boolean, false),
    loaded: types.optional(types.boolean, false),
    authenticationStore: types.optional(AuthenticationStoreModel, {}),
    dataStore: types.optional(DataStoreModel, {}),
    errorStore: types.array(ErrorModel),
    eventStore: types.optional(EventsModel, {}),
    settingsStore: types.optional(SettingsModel, {
      showErrors: false,
    }),
    // mosaicStore: types.optional(MosaicStoreModel, {}),
  })
  .actions(withSetPropAction)
  .actions(store => ({
    commitError(error) {
      error.id = uniqueId('errors')
      // ErrorModel.time is required; backend auth-failure errors omit it.
      if (error.time === undefined || error.time === null) {
        error.time = Date.now()
      }
      store.errorStore.unshift(error)
    },
    start() {
      store.isLoading = true
      if (ws) {
        ws.disconnect()
      }
      ws = new APIWebSocket(`wss://${Config.API_HOST}/api/ws`)
      ws.onmessage = payload => {
        if (payload.data?.event) {
          switch (payload.target) {
            case 'device':
              store.dataStore.commitDeviceEvent(payload.data.event)
              break
            case 'tag':
              store.dataStore.commitTagEvent(payload.data.event)
              break
            case 'location':
              store.dataStore.commitLocationEvent(payload.data.event)
              break
            case 'knx':
              // The knx envelope has no `value`; commitLocationEvent would
              // clobber location.status.knx_state with undefined. The real
              // per-location status already arrives via the 'location' target.
              store.dataStore.commitKNXEvent(payload.data.event)
              break
            case 'app':
              if (payload.data.event.type === 'refresh') {
                store.dataStore.fetchData()
              }
          }
        } else if (payload.error) {
          this.commitError(payload.error)
        } else {
          console.error(payload)
        }
      }
      ws.onconnected = () => {
        store.dataStore.setProp('wsConnected', true)
      }
      ws.onclose = () => {
        store.dataStore.setProp('wsConnected', false)
        store.setProp('isLoading', false)
        store.setProp('loaded', false)
      }
      const connectWs = ({ authToken }: AuthenticationStoreSnapshot) => {
        if (authToken) {
          ws.setToken(authToken)
        }
      }
      connectWs(store.authenticationStore)
      onSnapshot(store.authenticationStore, authenticationStore => {
        connectWs(authenticationStore)
      })
      store.isLoading = false
      store.loaded = true
    },
  }))

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
