import React, { useMemo, useEffect } from 'react'
import { MosaicWindow } from 'react-mosaic-component'
import { Paper, ButtonGroup, Button } from '@mui/material'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import useActions, {
  actionLabel,
  iconMap,
  ItemType,
} from '../../hooks/useActions'
import DeviceInfo from './deviceInfo'
import { useStores } from '../../models'
import { Device } from '../../models/DataStore'
import { DeviceStatus } from '../../models/DataStore/DeviceStatus'
import { observer } from 'mobx-react-lite'
import { toJS } from 'mobx'

interface ObjectTreeItemProps {
  item: any
  nodeId: string
}

const ObjectTreeItem = observer<ObjectTreeItemProps>(({ item, nodeId }) => {
  if (!item || !Object.entries(item)) {
    return null
  }
  return (
    <>
      {Object.entries(item).map(([key, value]) => (
        <TreeItem
          key={`${nodeId}.${key}`}
          itemId={`${nodeId}.${key}`}
          label={key}
        >
          {typeof value === 'object' ? (
            <ObjectTreeItem nodeId={`${nodeId}.${key}`} item={value} />
          ) : (
            <TreeItem
              itemId={`${nodeId}.${key}.${value}`}
              label={String(value)}
            />
          )}
        </TreeItem>
      ))}
    </>
  )
})

const Actions = observer<{ id: number; status: DeviceStatus }>(
  ({ id, status }) => {
    const {
      capabilities,
      is_online,
      should_wake,
      should_shutdown,
      should_reboot,
      is_muted,
    } = status

    const actions = useActions(
      {
        type: ItemType.device,
        capabilities,
        is_online,
        is_muted,
        should_wake,
        should_reboot,
        should_shutdown,
      },
      [
        capabilities,
        is_online,
        is_muted,
        should_wake,
        should_reboot,
        should_shutdown,
      ],
    )

    if (capabilities.length === 0) {
      return null
    }

    return (
      <ButtonGroup sx={{ marginBottom: '1rem' }}>
        {Object.entries(actions).map(([key, { action, disabled, loading }]) => (
          <Button
            key={key}
            loading={loading}
            loadingPosition="end"
            onClick={() => action({ id })}
            disabled={disabled}
            endIcon={iconMap(key)}
            variant="outlined"
          >
            {actionLabel(key)}
          </Button>
        ))}
      </ButtonGroup>
    )
  },
)

const DeviceComponent = ({ path, target }) => {
  const { dataStore } = useStores()
  const device = useMemo<Device>(
    () => dataStore.getDevice(target),
    [target, dataStore],
  )
  const windowTitle = useMemo(() => {
    return `${device.name} (${device.data.primary_ip?.dns_name})`
  }, [device.name, device.data])

  useEffect(() => device.fetch(), [device])
  return (
    <MosaicWindow title={windowTitle} path={path}>
      <Paper sx={{ p: 2 }} style={{ height: '100%', overflowY: 'auto' }}>
        <Actions id={device.id} status={device.status} />
        <DeviceInfo id={device.id} />
        <div style={{ height: '1rem' }} />
        <SimpleTreeView
          slots={{
            collapseIcon: ExpandMoreIcon,
            expandIcon: ChevronRightIcon,
          }}
        >
          <TreeItem
            key={`${device.id}.root`}
            itemId={`${device.id}.root`}
            label="All Device Properties"
          >
            <ObjectTreeItem item={device} nodeId={`${device.id}.eventsRoot`} />
          </TreeItem>
        </SimpleTreeView>
      </Paper>
    </MosaicWindow>
  )
}

export default DeviceComponent
