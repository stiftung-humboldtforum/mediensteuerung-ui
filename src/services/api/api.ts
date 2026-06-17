/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://github.com/infinitered/ignite/blob/master/docs/Backend-API-Integration.md)
 * documentation for more details.
 */
import {
  ApiResponse, // @demo remove-current-line
  ApisauceInstance,
  create,
} from 'apisauce'
import Config from '../../config'
import { DataStoreSnapshotIn } from '../../models/DataStore'
import { GeneralApiProblem, getGeneralApiProblem } from './apiProblem'
import type { ApiConfig, ApiDataResponse } from './api.types'
import { EventSnapshotIn, EventSnapshotOut } from '../../models/EventStore'
import { IKeyValueMap, toJS } from 'mobx'
import { TagData } from '../../models/DataStore/Tag'

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  host: Config.API_HOST,
  timeout: 120000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: `https://${this.config.host}`,
      timeout: this.config.timeout,
      headers: {
        Accept: 'application/json',
      },
    })
  }

  async action({ type, action, data }) {
    await this.apisauce.post(`/api/${type}/${action}`, data)
  }

  async getEvents(): Promise<IKeyValueMap<EventSnapshotIn>> {
    const response = await this.apisauce.get('/api/calendar/get_events')
    const data = response.data as Array<any>
    return (data?.reduce(
      (acc, val) => ({ ...acc, [val._id]: { ...val, id: val._id } }),
      {},
    ) || {}) as any
  }

  async getKNXEvents(): Promise<Array<any>> {
    const response = await this.apisauce.get('/api/knx/get_events')
    const data = (response.data as Array<any>).map(event => ({
      ...event,
      ...event.data.event,
      id: event._id,
    })) as Array<any>
    return data
  }

  async postEvent(event: EventSnapshotOut) {
    await this.apisauce.post('/api/calendar/save_event', toJS(event))
  }

  async deleteEvent(
    event: EventSnapshotOut,
  ): Promise<null | GeneralApiProblem> {
    const response = await this.apisauce.delete(
      `/api/calendar/delete_event/${event.id}`,
    )
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
  }

  async getData(): Promise<DataStoreSnapshotIn | GeneralApiProblem> {
    const response: ApiResponse<ApiDataResponse> = await this.apisauce.get(
      '/api/',
    )
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    const data = response.data
    return {
      devices: data.devices
        .map(device => ({
          id: String(device.id),
          data: {
            ...device,
            primary_ip: device.primary_ip
              ? {
                  ...device.primary_ip,
                  tags: device.primary_ip?.tags.map(tag => tag.id),
                }
              : null,
            tags: device.tags
              .sort((a: TagData, b: TagData) => a.name.localeCompare(b.name))
              .map(tag => tag.id),
            location: device.location?.id,
          },
        }))
        .reduce((acc, val) => ({ ...acc, [val.id]: val }), {}),
      tags: data.tags
        .map(tag => ({
          id: String(tag.id),
          data: {
            ...tag,
            devices: data.devices
              .filter(
                device =>
                  !!device.tags.find(deviceTag => deviceTag.id === tag.id),
              )
              .map(({ id }) => String(id)),
          },
        }))
        .reduce((acc, val) => ({ ...acc, [val.id]: val }), {}),
      locations: data.locations
        .map(location => ({
          id: String(location.id),
          data: {
            ...location,
            parent: location.parent,
            tags: data.tags
              .filter(
                tag =>
                  !!data.devices
                    .filter(device => device.location?.id === location.id)
                    .find(device =>
                      device.tags.find(deviceTag => deviceTag.id === tag.id),
                    ),
              )
              .sort((a: TagData, b: TagData) => a.name.localeCompare(b.name))
              .map(tag => tag.id),
            devices: data.devices
              .filter(device => device.location?.id === location.id)
              .map(({ id }) => String(id)),
          },
        }))
        .reduce((acc, val) => ({ ...acc, [val.id]: val }), {}),
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
