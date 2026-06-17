import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  Button,
  ButtonGroup,
  Checkbox,
  Dialog,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
} from '@mui/material'
import { RRule } from 'rrule'
import { ObjectId } from 'bson'
import { Moment } from 'moment'
import DateRange from './daterange'
import Repeat from './repeat'
import Items from './items'
import EventActions from './eventActions'

const EventDialog = ({
  id,
  open,
  onClose,
  extendedProps,
  start,
  end,
  rrule,
  allDay,
  remove,
}: {
  id?: string
  open: boolean
  onClose: CallableFunction
  start: Moment
  end?: Moment
  rrule?: string
  allDay?: boolean
  extendedProps?: any
  remove?: CallableFunction
}) => {
  const [_extendedProps, setExtendedProps] = useState(extendedProps)
  const [_allDay, setAllDay] = useState(allDay)
  const [_repeat, setRepeat] = useState<RRule>(rrule && RRule.fromString(rrule))
  const [_start, setStart] = useState<Moment>(start)
  const [_end, setEnd] = useState<Moment>(end)

  const isValid = useMemo(
    () =>
      !!_start &&
      !!_end &&
      _end?.isAfter(_start) &&
      !!_extendedProps?.actions &&
      (_extendedProps.actions?.start !== '' ||
        _extendedProps.actions?.end !== ''),
    [_start, _end, _extendedProps],
  )

  const save = useCallback(() => {
    const event = {
      id: id || new ObjectId().toString(),
      allDay: _allDay,
      start: _start.toDate(),
      end: _end.toDate(),
      rrule: _repeat?.toString(),
      title: _extendedProps.label,
      extendedProps: _extendedProps,
    }
    onClose(event)
  }, [id, onClose, _allDay, _repeat, _start, _end, _extendedProps])

  const handleItemChange = useCallback(item => {
    if (item === null) {
      setExtendedProps(null)
    } else {
      setExtendedProps(item)
    }
  }, [])

  const handleActionsChange = useCallback(value => {
    setExtendedProps(props => {
      if (props === null) {
        return null
      } else {
        return { ...props, actions: value }
      }
    })
  }, [])

  useEffect(() => {
    setExtendedProps(extendedProps)
  }, [extendedProps])

  useEffect(() => {
    setStart(start)
  }, [start])

  useEffect(() => {
    if (!end || !end.isValid() || start?.isAfter(end)) {
      if (start) {
        const e = start.clone()
        e.add(1, allDay ? 'd' : 'h')
        setEnd(e)
      }
    } else {
      setEnd(end)
    }
  }, [start, end, allDay])

  useEffect(() => {
    setRepeat(rrule && RRule.fromString(rrule))
  }, [rrule])

  useEffect(() => {
    setAllDay(allDay)
  }, [allDay])

  useEffect(() => {
    if (_allDay) {
      const diff = _end?.diff(_start, 'days')
      if (diff < 1) {
        const e = _start.clone()
        e.hour(0)
        e.minute(0)
        e.add(1, 'd')
        setEnd(e)
      }
    }
  }, [_allDay, _start, _end])

  useEffect(() => {
    if (_allDay) {
      setStart(s => {
        s.hour(0)
        s.minute(0)
        return s
      })
      setEnd(e => {
        e.hour(0)
        e.minute(0)
        return e
      })
    }
  }, [_allDay])

  useEffect(() => {
    return () => {
      onClose()
    }
  }, [])

  if (!_start) {
    return null
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setExtendedProps(null)
        onClose()
      }}
      fullWidth
    >
      <DialogTitle>{id ? 'Edit' : 'Create'} Event</DialogTitle>
      <List>
        <ListItem sx={{ display: 'flex' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={_allDay}
                onChange={(_, value) => setAllDay(value)}
              />
            }
            label="All Day"
            sx={{ whiteSpace: 'nowrap', paddingLeft: '10px' }}
          />
          <DateRange
            start={_start}
            end={_end}
            setStart={setStart}
            setEnd={setEnd}
            allDay={_allDay}
          />
        </ListItem>
        <ListItem>
          <Repeat
            start={_start}
            end={_end}
            value={_repeat}
            onChange={value => setRepeat(value)}
          />
        </ListItem>
        <ListItem sx={{ width: '100%' }}>
          <Items
            value={_extendedProps}
            onChange={(_, item) => {
              handleItemChange(item)
            }}
          />
        </ListItem>
        <ListItem>
          <EventActions
            itemType={_extendedProps?.type}
            itemId={_extendedProps?.id}
            value={_extendedProps?.actions}
            onChange={handleActionsChange}
          />
        </ListItem>
        <ListItem>
          <ButtonGroup variant="text" fullWidth>
            <Button color="error" onClick={() => remove()} disabled={!remove}>
              Delete
            </Button>
            <Button
              onClick={() => {
                onClose(null)
                setExtendedProps(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={save} color="success" disabled={!isValid}>
              Save
            </Button>
          </ButtonGroup>
        </ListItem>
      </List>
    </Dialog>
  )
}

export default EventDialog
