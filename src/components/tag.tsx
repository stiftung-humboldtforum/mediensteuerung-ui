import React, {
  memo,
  useMemo,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react'
import fontColorContrast from 'font-color-contrast'
import styled, { css } from 'styled-components'
import { addToLargest } from '../utils/mosaic'
import { MosaicContext } from 'react-mosaic-component'
import { Box, Tooltip } from '@mui/material'
import { Tag as TagInstance } from '../models/DataStore/Tag'

interface TagProps {
  name: string
  color: string
  id: number
}

const TagContainer = styled.span<{
  $backgroundColor: string
  $textColor: string
}>`
  padding: 5px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  font-family: 'IBM Plex Mono';
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 36px;
  justify-content: center;
  user-select: none;
  cursor: pointer;
  hyphens: auto;
  ${({ $backgroundColor, $textColor }) => css`
    background-color: ${$backgroundColor};
    color: ${$textColor};
  `}
`

export const Tag = memo<TagProps>(({ name, color, id }) => {
  const { mosaicActions } = useContext(MosaicContext)
  const backgroundColor = `#${color}`
  const textColor = useMemo(() => fontColorContrast(color), [color])
  const open = useCallback(() => {
    mosaicActions.replaceWith(
      [],
      addToLargest({
        currentNode: mosaicActions.getRoot(),
        newNode: `tag_${id}`,
      }),
    )
  }, [mosaicActions, id])

  return (
    <TagContainer
      onClick={open}
      $backgroundColor={backgroundColor}
      $textColor={textColor}
      className="tag-container"
    >
      {name}
    </TagContainer>
  )
})

// Plain component taking the container ref as a normal prop instead of via
// forwardRef — forwardRef here crashed production (Rollup) builds with
// React error #300 ("rendered fewer hooks than expected") while working
// fine under the Vite dev server (esbuild); the ref never needs to cross a
// real component boundary (Tags owns it end-to-end), so forwardRef was
// unnecessary complexity, not a requirement.
const TagsContent = ({
  toolTip = false,
  boxRef,
  ...props
}: any) => {
  return (
    <Box
      ref={boxRef}
      sx={{
        width: 'fit-content',
        display: 'flex',
        justifyContent: 'start',
        gap: '5px',
        flexWrap: toolTip ? 'wrap' : 'nowrap',
      }}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
      onMouseLeave={props.onMouseLeave}
      onMouseOver={props.onMouseOver}
      onTouchEnd={props.onTouchEnd}
      onTouchStart={props.onTouchStart}
      data-mui-internal-clone-element
    >
      {props.tags
        ?.filter(({ data }) => !data.name.startsWith('ctrl'))
        .map(tag => (
          <Tag
            key={tag.data.id}
            id={tag.id}
            name={tag.data.name}
            color={tag.data.color}
          />
        ))}
    </Box>
  )
}

export const Tags = (props: { tags: Array<TagInstance> }) => {
  const { tags } = props
  const parentRef = useRef<HTMLDivElement | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)
  const [shouldUpdate, setShouldUpdate] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  useEffect(() => {
    if (shouldUpdate) {
      setShowTooltip(ref.current?.offsetWidth > parentRef.current?.offsetWidth)
    }
  }, [shouldUpdate])
  return (
    <div
      ref={el => {
        parentRef.current = el
        setShouldUpdate(!!el)
      }}
      style={{ width: '100%' }}
    >
      {showTooltip ? (
        <Tooltip
          arrow
          title={<TagsContent tags={tags} toolTip />}
          slotProps={{
            popper: {
              anchorEl: parentRef.current,
              sx: { justifyContent: 'center' },
            },
          }}
        >
          <TagsContent boxRef={ref} tags={tags} />
        </Tooltip>
      ) : (
        <TagsContent
          boxRef={el => {
            ref.current = el
          }}
          tags={tags}
        />
      )}
    </div>
  )
}
