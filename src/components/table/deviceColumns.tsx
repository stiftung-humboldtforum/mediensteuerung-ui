import React from 'react'
import { GridColDef, getGridNumericOperators } from '@mui/x-data-grid'
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
    valueGetter: (_value, row) =>
      row.data.primary_ip?.dns_name || row.data.name,
  },
  {
    field: 'description',
    headerName: 'Description',
    sortable: true,
    flex: 0.5,
    valueGetter: (_value, row) => row.data.primary_ip.description,
  },
  {
    // geändert DA: Update Netbox
    // field: 'device_role',
    field: 'role',
    headerName: 'Role',
    sortable: true,
    valueGetter: (_value, row) =>
      // geändert DA: Update Netbox
      // row.data.device_role?.name,
      row.data.role?.name,
    flex: 0.5,
    minWidth: 100,
  },
  {
    field: 'device_type',
    headerName: 'Type',
    sortable: true,
    valueGetter: (_value, row) =>
      `${row.data.device_type?.manufacturer.name} ${row.data.device_type.model}`,
    flex: 0.5,
    minWidth: 100,
  },
  {
    field: 'uptime',
    headerName: 'Uptime',
    sortable: true,
    valueGetter: (_value, row) =>
      row.status.uptime ? row.status.uptime : null,
    valueFormatter: value => value && secondsToDhms(value),
    filterOperators: getGridNumericOperators(),
    flex: 0.5,
    minWidth: 100,
  },
  {
    field: 'primary_ip',
    headerName: 'Primary IP',
    sortable: true,
    flex: 0.5,
    valueGetter: (_value, row) => row.data.primary_ip?.address,
    minWidth: 138,
    renderCell: ({ value }) => <Ip value={value} />,
  },
  rowTags(),
  {
    field: 'location',
    headerName: 'Location',
    sortable: true,
    flex: 0.5,
    valueGetter: (_value, row) =>
      `${row.data.location?.name} (${row.data.location?.data.name})`,
  },
  rowActions({ node, variant: 'device' }),
]
