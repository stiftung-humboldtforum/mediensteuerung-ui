import React, { useMemo } from 'react'
import { createFilterOptions, Chip } from '@mui/material'
import {
  GridFilterInputValueProps,
  GridFilterItem,
  GridFilterOperator,
} from '@mui/x-data-grid'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../models'
import { values } from 'mobx'
import { Tag } from '../../models/DataStore/Tag'
import CustomAutocomplete from '../autocomplete'

const TagInputValue = observer<GridFilterInputValueProps>(props => {
  const { dataStore } = useStores()
  const { item, applyValue, focusElementRef } = props

  const filterOptions = createFilterOptions({
    stringify: (option: any) =>
      [option.label, option.data.description].join(' '),
  })

  const handleFilterChange = (newValue: Array<Tag>) => {
    applyValue({ ...item, value: newValue })
  }

  const options = useMemo(() => {
    return values(dataStore.tags).map((tag: Tag) => ({
      label: tag.name,
      description: tag.data.description,
      id: tag.id,
      data: tag.data,
    }))
  }, [dataStore.tags])

  return (
    <CustomAutocomplete
      options={options}
      filterOptions={filterOptions}
      getOptionLabel={option => `${option.data.name}`}
      isOptionEqualToValue={({ id }, { id: id2 }) => id === id2}
      onChange={(_, value) => handleFilterChange(value)}
      value={item.value || []}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          // getTagProps returns a `key`; React 19 warns if it is spread, so
          // pull it out and pass it explicitly.
          const { key, ...tagProps } = getTagProps({ index })
          return (
            <Chip key={key} label={option.label} {...tagProps} size="small" />
          )
        })
      }
      multiple
    />
  )
})

export const tagFilterOperators: Array<GridFilterOperator> = [
  {
    label: 'any of',
    value: 'tags_contain',
    getApplyFilterFn(filterItem: GridFilterItem) {
      if (!filterItem.field || !filterItem.value || !filterItem.operator) {
        return null
      }
      return (_value: any, row: any): boolean => {
        if (filterItem.value.length === 0) {
          return true
        }
        const tagIds = row.tags.map(({ id }) => id)
        const filterIds = filterItem.value.map(({ id }) => id)
        return !!tagIds.filter(
          filterId => !!filterIds.filter(id => filterId === id).length,
        ).length
      }
    },
    InputComponent: TagInputValue,
  },
  {
    label: 'all of',
    value: 'tags_all',
    getApplyFilterFn(filterItem: GridFilterItem) {
      if (!filterItem.field || !filterItem.value || !filterItem.operator) {
        return null
      }
      return (_value: any, row: any): boolean => {
        if (filterItem.value.length === 0) {
          return true
        }
        const tagIds = row.tags.map(({ id }) => id)
        const filterIds = filterItem.value.map(({ id }) => id)
        return (
          tagIds.filter(
            filterId => !!filterIds.filter(id => filterId === id).length,
          ).length === filterItem.value.length
        )
      }
    },
    InputComponent: TagInputValue,
  },
  {
    label: 'none of',
    value: 'tags_not_contain',
    getApplyFilterFn(filterItem: GridFilterItem) {
      if (!filterItem.field || !filterItem.value || !filterItem.operator) {
        return null
      }
      return (_value: any, row: any): boolean => {
        if (filterItem.value.length === 0) {
          return true
        }
        return !!row.tags.filter(
          ({ id }) =>
            !filterItem.value.filter(({ id: filterId }) => filterId === id)
              .length,
        ).length
      }
    },
    InputComponent: TagInputValue,
  },
]
