import React from 'react'
import {
  GridColDef,
  GridValueGetterParams,
  getGridNumericOperators,
} from '@mui/x-data-grid'
import Ip from '../ip'
import { grabHandle, rowStatus, rowTags, rowActions } from './commonColumns'
import { ItemType } from '../../hooks/useActions'
import { secondsToDhms } from '../../utils/time'

export const deviceColumns = ({ node }): Array<GridColDef> => [
  grabHandle({ variant: ItemType.device }),
  rowStatus(),
  {
    field: 'name',
    headerName: 'Name',
    sortable: true,
    flex: 0.5,
    minWidth: 100,
    valueGetter: (params: GridValueGetterParams) =>
      params.row.data.primary_ip?.dns_name || params.row.data.name,
  },
  {
    field: 'description',
    headerName: 'Description',
    sortable: true,
    flex: 0.5,
    valueGetter: ({ row }) => row.data.primary_ip.description,
  },
  {
    // geändert DA: Update Netbox
    // field: 'device_role',
    field: 'role',
    headerName: 'Role',
    sortable: true,
    valueGetter: (params: GridValueGetterParams) =>
      // geändert DA: Update Netbox
      // params.row.data.device_role?.name,
      params.row.data.role?.name,
    flex: 0.5,
    minWidth: 100,
  },
  {
    field: 'device_type',
    headerName: 'Type',
    sortable: true,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.data.device_type?.manufacturer.name} ${params.row.data.device_type.model}`,
    flex: 0.5,
    minWidth: 100,
  },
  {
    field: 'uptime',
    headerName: 'Uptime',
    sortable: true,
    valueGetter: (params: GridValueGetterParams) =>
      params.row.status.uptime ? params.row.status.uptime : null,
    valueFormatter: ({ value }) => value && secondsToDhms(value),
    filterOperators: getGridNumericOperators(),
    flex: 0.5,
    minWidth: 100,
  },
  {
    field: 'primary_ip',
    headerName: 'Primary IP',
    sortable: true,
    flex: 0.5,
    valueGetter: (params: GridValueGetterParams) =>
      params.row.data.primary_ip?.address,
    minWidth: 138,
    renderCell: ({ value }) => <Ip value={value} />,
  },
  rowTags(),
  {
    field: 'location',
    headerName: 'Location',
    sortable: true,
    flex: 0.5,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.data.location?.name} (${params.row.data.location?.data.name})`,
  },
  rowActions({ node, variant: 'device' }),
]
