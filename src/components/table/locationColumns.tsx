import React from 'react'
import {
  GridColDef,
  GridRenderCellParams,
  getGridSingleSelectOperators,
  GRID_SINGLE_SELECT_COL_DEF,
} from '@mui/x-data-grid'
import { ItemType } from '../../hooks/useActions'
import { grabHandle, rowStatus, rowTags, rowActions } from './commonColumns'
import { FlashOn, FlashOff } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'

type KNXCellInterface = {
  row: {
    status: {
      knx_state: number
    }
  }
}

export const KNXCell = observer(({ params }: { params: KNXCellInterface }) => {
  switch (params.row.status.knx_state) {
    case -1:
      return <div style={{ textAlign: 'center', width: '100%' }}>…</div>
    case 0:
      return (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <FlashOff />
        </div>
      )
    case 1:
      return (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <FlashOn />
        </div>
      )
  }
})

export const locationColumns = ({ node }): Array<GridColDef> => [
  grabHandle({ variant: ItemType.location }),
  rowStatus(),
  {
    ...GRID_SINGLE_SELECT_COL_DEF,
    field: 'knx_state',
    headerName: 'KNX Switch',
    sortable: true,
    width: 70,
    valueOptions: () => [
      { value: -1, label: 'Undefined' },
      { value: 0, label: 'Off' },
      { value: 1, label: 'On' },
    ],
    filterOperators: getGridSingleSelectOperators(),
    valueGetter: (_value, row) => row.status.knx_state,
    renderCell: (params: GridRenderCellParams) => <KNXCell params={params} />,
  },
  {
    field: 'parent',
    headerName: 'Parent',
    sortable: true,
    flex: 0.5,
    minWidth: 100,
    valueGetter: (_value, row) => row.data.parent?.name,
  },
  {
    field: 'name',
    headerName: 'Name',
    sortable: true,
    flex: 0.5,
    minWidth: 100,
    valueGetter: (_value, row) => row.data.name,
  },
  {
    field: 'description',
    headerName: 'Description',
    sortable: true,
    flex: 0.5,
    valueGetter: (_value, row) => row.data.description,
  },
  rowTags(),
  rowActions({ node, variant: ItemType.location }),
]
