import React from 'react'
import { Autocomplete, TextField, Popper } from '@mui/material'
import { styled } from 'styled-components'

const CustomPopper = props => {
  return <Popper {...props} style={{ width: 'fit-content' }} />
}

export const Option = styled.li`
  width: min-contnent;
  display: flex;
  justify-items: space-between;
  gap: 0 0.5rem;
  grid-template-columns: max-content min-content;
  border-bottom: solid #808080 1px;
  flex-wrap: wrap;
`

export const OptionLabel = styled.div`
  flex-grow: 1;
  white-space: break-spaces;
  hyphens: auto;
  display: flex;
  gap: 0 5px;
  align-items: center;
`

export const OptionDescription = styled.div`
  font-size: 0.75rem;
  opacity: 0.75;
  justify-self: end;
`

const CustomAutocomplete = props => {
  return (
    <Autocomplete
      renderInput={params => (
        <TextField {...params} label="Tags" variant="standard" />
      )}
      renderOption={(props, option: any) => (
        <Option {...props} key={option.id}>
          <OptionLabel>{option.label}</OptionLabel>
          <OptionDescription>{option.description}</OptionDescription>
        </Option>
      )}
      slots={{ popper: CustomPopper }}
      {...props}
    />
  )
}

export default CustomAutocomplete
