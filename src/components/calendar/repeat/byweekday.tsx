import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from '@mui/material'
import { ByWeekday as ByWeekdayType } from 'rrule'
import { array_equals } from '../../../utils/array'

const fields = {
  MO: 0,
  TU: 1,
  WE: 2,
  TH: 3,
  FR: 4,
  SA: 5,
  SU: 6,
}

const computeState = value =>
  Object.entries(fields).reduce(
    (acc, [key]) => ({ ...acc, [key]: value?.includes(fields[key]) }),
    {},
  )

const ByWeekday = ({
  value,
  onChange = () => null,
}: {
  value: Array<ByWeekdayType>
  onChange?: (arg0?: Array<ByWeekdayType>) => void
}) => {
  const [state, setState] = useState(computeState(value))

  useEffect(() => {
    setState(computeState(value))
  }, [value])

  const handleChange = useCallback(
    ({ target }) => {
      setState({
        ...state,
        [target.name]: target.checked,
      })
    },
    [state],
  )

  const save = useCallback(() => {
    const newValue = Object.entries(state)
      .filter(([_, value]) => value)
      .map(([key]) => fields[key])
    if (!array_equals(value, newValue)) {
      onChange(
        Object.entries(state)
          .filter(([_, value]) => value)
          .map(([key]) => fields[key]),
      )
    }
  }, [onChange, value, state])

  return (
    <FormGroup>
      <FormLabel>Repeat on</FormLabel>
      <FormGroup row onChange={handleChange} onBlur={save}>
        {Object.keys(fields).map(value => (
          <FormControlLabel
            key={`weekday_${value}`}
            label={value[0]}
            labelPlacement="top"
            control={<Checkbox checked={state[value]} name={value} />}
          />
        ))}
      </FormGroup>
    </FormGroup>
  )
}

export default ByWeekday
