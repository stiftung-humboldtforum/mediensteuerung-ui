import React from 'react'
import {
  GridColDef,
  GridRenderCellParams,
  GRID_SINGLE_SELECT_COL_DEF,
  GridSingleSelectColDef,
} from '@mui/x-data-grid'
import { Tags } from '../tag'
import { GrabHandle, StatusCell, RowActions } from './cells'
import { tagFilterOperators } from './filterOperators'
import { Status } from '../../models/DataStore/Common'

const RenderGrabHandle = (params: any) => {
  return <GrabHandle item={params.row} type={params.variant} />
}

export const grabHandle = ({ variant }): GridColDef => ({
  field: '__grab__',
  renderHeader: () => ' ',
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  disableExport: true,
  disableReorder: true,
  headerAlign: 'center',
  width: 34,
  renderCell: (params: GridRenderCellParams) => (
    <RenderGrabHandle {...params} variant={variant} />
  ),
})

export const rowStatus = (): GridSingleSelectColDef => ({
  ...GRID_SINGLE_SELECT_COL_DEF,
  field: 'is_online',
  headerName: 'State',
  renderHeader: () => ' ',
  sortable: true,
  width: 70,
  disableExport: true,
  valueOptions: () => [
    { value: 0, label: Status[0] },
    { value: 1, label: Status[1] },
    { value: 2, label: Status[2] },
  ],
  valueGetter: (_value, row) => row.status.is_online,
  renderCell: ({ row }) => <StatusCell item={row} />,
})

export const rowTags = (): GridColDef => ({
  field: 'tags',
  headerName: 'Tags',
  sortable: true,
  flex: 1,
  filterOperators: tagFilterOperators,
  valueGetter: (_value, row) =>
    row.tags
      .map(({ name }) => name)
      .sort((a: string, b: string) => a.localeCompare(b))
      .join(' '),
  renderCell: (props: GridRenderCellParams) => {
    return <Tags tags={props.row.tags} />
  },
})

export const rowActions = ({ node, variant }): GridColDef => ({
  field: 'actions',
  headerName: 'Actions',
  renderHeader: () => ' ',
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  disableExport: true,
  disableReorder: true,
  headerAlign: 'center',
  width: 100,
  renderCell: ({ row }) => (
    <RowActions node={node} item={row} variant={variant} />
  ),
})
