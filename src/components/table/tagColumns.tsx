import { GridColDef } from '@mui/x-data-grid'
import React from 'react'
import { ItemType } from '../../hooks/useActions'
import { Tag } from '../tag'
import { grabHandle, rowStatus, rowActions } from './commonColumns'

export const tagColumns = ({ node }): Array<GridColDef> => [
  grabHandle({ variant: ItemType.tag }),
  rowStatus(),
  {
    field: 'name',
    headerName: 'Name',
    sortable: true,
    flex: 1,
    minWidth: 100,
    valueGetter: (_value, row) => row.data.name,
    renderCell: ({ row }) => (
      <Tag id={row.id} name={row.data.name} color={row.data.color} />
    ),
  },
  {
    field: 'description',
    headerName: 'Description',
    sortable: true,
    flex: 1,
    valueGetter: (_value, row) => row.data.description,
  },
  {
    field: 'device_count',
    headerName: 'Device count',
    sortable: true,
    flex: 1,
    type: 'number',
    valueGetter: (_value, row) => row.data.devices.length,
  },
  rowActions({ node, variant: ItemType.tag }),
]
