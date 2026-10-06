import React, { useRef, useEffect, useState } from 'react'
import { Paper } from '@mui/material'
import { MosaicWindow } from 'react-mosaic-component'
import { useStores } from '../models'
import { observer } from 'mobx-react-lite'
import { onSnapshot } from 'mobx-state-tree'
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid'
import { useThrottle } from '../hooks/useThrottle'
import moment from 'moment'
import { toJS } from 'mobx'

const Errors = ({ path }) => {
  const apiRef = useGridApiRef()
  const { errorStore } = useStores()
  const ref = useRef<HTMLDivElement>(null)
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setErrors(toJS(errorStore))
    setIsLoading(false)
  }, [errorStore])

  const updateTable = useThrottle(() => {
    try {
      setErrors(toJS(errorStore))
      apiRef.current.applySorting()
      apiRef.current.unstable_applyFilters()
    } catch (e) {
      return
    }
  }, 500)

  useEffect(() => {
    const _disposer = onSnapshot(errorStore, updateTable)
    return () => _disposer()
  }, [apiRef, errorStore, updateTable])

  return (
    <MosaicWindow title={'Errors'} path={path}>
      <Paper
        sx={{
          height: '100%',
        }}
        ref={ref}
      >
        <DataGrid
          apiRef={apiRef}
          rows={errors}
          loading={isLoading}
          columns={[
            {
              field: 'message',
              headerName: '',
              flex: 1,
            },
            {
              field: 'errors',
              headerName: '',
              valueGetter: (_value, row) => row.errors.join(' '),
              flex: 1,
            },
            {
              field: 'time',
              headerName: '',
              valueFormatter: value => moment(value).toString(),
              flex: 1,
            },
          ]}
          slots={{
            toolbar: GridToolbar,
          }}
          density="compact"
          slotProps={{
            toolbar: { showQuickFilter: true },
          }}
        />
      </Paper>
    </MosaicWindow>
  )
}

export default observer(Errors)
