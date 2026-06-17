import { Instance, SnapshotOut, SnapshotIn, types } from 'mobx-state-tree'
import { api } from '../services/api'
import { withSetPropAction } from './helpers/withSetPropAction'
import { enqueueSnackbar } from 'notistack'
import { ItemType } from '../hooks/useActions'

export const EventModel = types.model({
  id: types.identifier,
  allDay: types.boolean,
  start: types.string,
  end: types.maybeNull(types.string),
  rrule: types.maybeNull(types.string),
  duration: types.maybeNull(types.number),
  title: types.string,
  backgroundColor: types.maybeNull(types.string),
  extendedProps: types.model({
    type: types.enumeration([ItemType.device, ItemType.tag, ItemType.location]),
    label: types.string,
    description: types.maybeNull(types.string),
    id: types.number,
    actions: types.maybeNull(
      types.model({
        start: types.string,
        end: types.string,
      }),
    ),
  }),
})

export const EventsModel = types
  .model({
    isLoading: true,
    events: types.map(EventModel),
  })
  .actions(withSetPropAction)
  .actions(store => ({
    async fetchEvents() {
      store.setProp('isLoading', true)
      store.setProp('events', await api.getEvents())
      store.setProp('isLoading', false)
    },
    async commitEvent(event: Event) {
      store.events.put(event)
      await api.postEvent(event)
      enqueueSnackbar('Saved event', { variant: 'success' })
    },
    async removeEvent(event: Event) {
      store.events.delete(event.id)
      await api.deleteEvent(event)
      enqueueSnackbar('Deleted event', { variant: 'success' })
    },
  }))

export interface Event extends Instance<typeof EventModel> {}
export interface EventSnapshotOut extends SnapshotOut<typeof EventModel> {}
export interface EventSnapshotIn extends SnapshotIn<typeof EventModel> {}
