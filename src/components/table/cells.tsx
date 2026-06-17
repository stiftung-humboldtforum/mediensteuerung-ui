import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  MutableRefObject,
  forwardRef,
} from 'react'
import { MosaicContext, getLeaves, MosaicNode } from 'react-mosaic-component'
import {
  CircularProgress,
  Popover,
  ButtonGroup,
  Tooltip,
  Box,
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { addToLargest } from '../../utils/mosaic'
import { Status } from '../../models/DataStore/Common'
import useActions, {
  actionLabel,
  iconMap,
  ItemType,
} from '../../hooks/useActions'
import { IconButton } from '@mui/material'
import {
  DragIndicator,
  MoreHoriz,
  OpenInNew,
  RadioButtonUnchecked,
  RadioButtonChecked,
  Error,
  HorizontalRule,
} from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { Device } from '../../models/DataStore/Device'
import { ObjectId } from 'bson'
import { Tag } from '../../models/DataStore/Tag'
import { Location } from '../../models/DataStore/Location'
import { ThirdPartyDraggable } from '@fullcalendar/interaction'
import { useDrag } from 'react-dnd'

export const GrabHandle = observer(
  forwardRef(
    (
      {
        item,
        type,
      }: {
        item: Device | Tag | Location
        type: ItemType
      },
      ref: MutableRefObject<HTMLButtonElement>,
    ) => {
      const itemInfo = useMemo(() => {
        let description: string
        switch (type) {
          case ItemType.device:
            description = item.data.primary_ip?.dns_name
            break
          case ItemType.tag:
            description = item.data.description
            break
          case ItemType.location:
            description = item.data.name
        }
        return {
          type,
          label: item.name,
          description,
          id: item.id,
        }
      }, [
        type,
        item.name,
        item.data.description,
        item.data.name,
        item.data.primary_ip,
        item.id,
      ])

      const getEventData = useCallback(
        () => ({
          id: new ObjectId(),
          title: itemInfo.label,
          extendedProps: itemInfo,
        }),
        [itemInfo],
      )

      const canDrag = !!item.capabilities.length

      useEffect(() => {
        let draggable: ThirdPartyDraggable

        if (ref?.current && canDrag) {
          draggable = new ThirdPartyDraggable(ref.current, {
            eventData: getEventData,
            itemSelector: '.dragHandle',
          })
        }
        return () => {
          if (draggable) {
            draggable.destroy()
          }
        }
      }, [ref, canDrag, type, getEventData])

      const [, drag] = useDrag(
        () => ({
          type: type,
          item: {
            ...itemInfo,
          },
          canDrag: true,
        }),
        [type, itemInfo],
      )

      if (!canDrag) {
        return null
      }

      drag(ref)

      return (
        <IconButton
          ref={ref}
          className="dragHandle"
          style={{ position: 'absolute', left: 55, cursor: 'grab' }}
          disableRipple
        >
          <DragIndicator />
        </IconButton>
      )
    },
  ),
)

const StatusIcon = ({ isLoading, hasError, isOnline, size = 'regular' }) => {
  const _size = useMemo(() => ({ small: 15, regular: 20 }[size]), [size])
  if (isLoading) {
    return <CircularProgress size={_size} />
  } else if (hasError && hasError.size > 0) {
    return <Error sx={{ fontSize: _size }} color="warning" />
  } else {
    switch (isOnline) {
      case Status.undefined:
        return <CircularProgress size={_size} />
      case Status.offline:
        return <HorizontalRule sx={{ fontSize: _size }} color="error" />
      case Status.intermediate:
        return <RadioButtonUnchecked sx={{ fontSize: _size }} color="warning" />
      case Status.online:
        return <RadioButtonChecked sx={{ fontSize: _size }} color="success" />
    }
  }
}

export const StatusCell = observer<{
  item: any
  size?: 'small' | 'regular'
}>(({ item, size = 'regular' }) => {
  const { is_online, should_wake, should_shutdown, should_reboot } = item.status

  const hasError: Set<string> = item.hasError

  const isLoading = useMemo(
    () =>
      is_online === Status.undefined ||
      should_wake ||
      should_shutdown ||
      should_reboot,
    [is_online, should_wake, should_shutdown, should_reboot],
  )

  const title = useMemo(() => {
    if (hasError && hasError.size > 0) {
      return `Error: ${[...hasError].join(', ')}`
    } else if (isLoading) {
      if (should_wake) {
        return 'Waking'
      } else if (should_shutdown) {
        return 'Shutting down'
      } else if (should_reboot) {
        return 'Rebooting'
      }
    } else {
      switch (is_online) {
        case Status.intermediate:
          return 'Partial'
        case Status.offline:
          return 'Offline'
        case Status.online:
          return 'Online'
      }
    }
  }, [
    hasError,
    isLoading,
    should_wake,
    should_shutdown,
    should_reboot,
    is_online,
  ])

  return (
    <Tooltip
      title={title}
      disableInteractive
      arrow
      onOpen={e => e.stopPropagation()}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          flexGrow: 0,
        }}
      >
        <StatusIcon
          isLoading={isLoading}
          hasError={hasError}
          isOnline={is_online}
          size={size}
        />
      </div>
    </Tooltip>
  )
})

interface RowActionsProps {
  node: MosaicNode<string>
  variant?: ItemType
  item: Device | Tag | Location
}

export const RowActions = observer<RowActionsProps>(
  ({ node, variant = ItemType.device, item }) => {
    const capabilities = item.capabilities
    const {
      status: {
        is_online,
        is_muted,
        should_shutdown,
        should_wake,
        should_reboot,
      },
    } = item
    const actions = useActions(
      {
        type: variant,
        capabilities,
        is_online,
        is_muted,
        should_shutdown,
        should_wake,
        should_reboot,
      },
      [
        capabilities,
        is_online,
        is_muted,
        should_shutdown,
        should_wake,
        should_reboot,
      ],
    )
    const { mosaicActions } = useContext(MosaicContext)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

    const clickActions = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      setAnchorEl(event.currentTarget)
    }

    const handleCloseActions = () => {
      setAnchorEl(null)
    }
    const isOpen = Boolean(anchorEl)

    const deviceWindowExists =
      getLeaves(node).indexOf(`${variant}_${item.id}`) !== -1

    const openInNew = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      mosaicActions.replaceWith(
        [],
        addToLargest({
          currentNode: mosaicActions.getRoot(),
          newNode: `${variant}_${item.id}`,
        }),
      )
    }

    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'end',
          gap: '10px',
        }}
      >
        {capabilities.length ? (
          <IconButton
            disabled={is_online === Status.undefined}
            onClick={clickActions}
            size="small"
            color="primary"
          >
            <MoreHoriz />
          </IconButton>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        <IconButton
          onClick={openInNew}
          disabled={deviceWindowExists}
          size="small"
          color="primary"
        >
          <OpenInNew />
        </IconButton>
        <Popover
          open={isOpen}
          anchorEl={anchorEl}
          onClose={handleCloseActions}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <ButtonGroup orientation="vertical">
            {Object.entries(actions).map(
              ([key, { action, disabled, loading }]) => (
                <LoadingButton
                  key={key}
                  loading={loading}
                  loadingPosition="end"
                  onClick={() => action({ id: item.id })}
                  disabled={disabled}
                  endIcon={iconMap(key)}
                  variant="outlined"
                >
                  {actionLabel(key)}
                </LoadingButton>
              ),
            )}
          </ButtonGroup>
        </Popover>
      </Box>
    )
  },
)
