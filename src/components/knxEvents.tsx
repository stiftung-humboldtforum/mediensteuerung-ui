import React, { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { MosaicWindow } from 'react-mosaic-component'
import { useStores } from '../models'
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  useGridApiRef,
} from '@mui/x-data-grid'
import { Startup } from '../containers'
import { Paper } from '@mui/material'
import moment from 'moment'
import { useThrottle } from '../hooks/useThrottle'
import { onSnapshot } from 'mobx-state-tree'
import { toJS } from 'mobx'

const KNXEvents = ({ path }) => {
  const apiRef = useGridApiRef()
  const { dataStore } = useStores()

  const [events, setEvents] = useState([])

  useEffect(() => {
    if (dataStore.knxEvents.isLoading) {
      dataStore.knxEvents.fetchEvents().then(() => {
        setEvents(toJS(dataStore.knxEvents.events))
      })
    } else {
      setEvents(toJS(dataStore.knxEvents.events))
    }
  }, [dataStore.knxEvents])

  const updateTable = useThrottle(() => {
    try {
      setEvents(toJS(dataStore.knxEvents.events))
      apiRef.current.applySorting()
      apiRef.current.unstable_applyFilters()
    } catch (e) {
      return
    }
  }, 500)

  useEffect(() => {
    const _disposer = onSnapshot(dataStore.knxEvents, updateTable)
    return () => _disposer()
  }, [apiRef, dataStore.knxEvents, updateTable])

  const columns = useMemo<Array<GridColDef>>(
    () => [
      {
        field: 'state',
        headerName: 'Value',
        sortable: true,
        valueGetter: value => {
          if (value) {
            return 'On'
          } else if (typeof value === 'boolean') {
            return 'Off'
          } else {
            return 'Undefined'
          }
        },
      },
      {
        field: 'target',
        headerName: 'Target',
        sortable: true,
        flex: 1,
        valueGetter: (value: any) =>
          `${value?.data.description} (${value?.data.name})`,
      },
      {
        field: 'group_address',
        headerName: 'Group Address',
        sortable: true,
        flex: 0.5,
        valueGetter: (value, row) =>
          `${
            value || row.target?.data.custom_fields.knx_switch_group_addresses
          }`,
      },
      {
        field: 'time',
        headerName: 'Time',
        flex: 1,
        valueFormatter: value => moment(value).toString(),
      },
    ],
    [],
  )

  if (dataStore.isLoading || dataStore.knxEvents.isLoading) {
    return (
      <MosaicWindow path={path} title="KNX Events">
        <Startup />
      </MosaicWindow>
    )
  }

  return (
    <MosaicWindow path={path} title="KNX Events">
      <Paper style={{ height: '100%' }}>
        <DataGrid
          apiRef={apiRef}
          rows={events}
          columns={columns}
          slots={{
            toolbar: GridToolbar,
          }}
        />
      </Paper>
    </MosaicWindow>
  )
}

export default observer(KNXEvents)
