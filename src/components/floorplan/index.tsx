import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  Paper,
  Typography,
  useTheme,
} from '@mui/material'
import { MosaicContext, MosaicWindow } from 'react-mosaic-component'
import { observer } from 'mobx-react-lite'
import { values } from 'mobx'
import { useStores } from '../../models'
import { addToLargest } from '../../utils/mosaic'
import { PLAN_FLOORS, PLAN_ROOMS, PlanRoom } from './planData'
import planSvgUrl from '../../assets/gebaeudeplan.svg?url'

// Interaktiver Gebäudeplan: zeigt die Etagen des Original-Leitsystem-Plans
// (assets/gebaeudeplan.svg, als Vite-Asset gebundelt) und legt die aus den
// Druckdaten extrahierten Raumnummern als klickbare Marker darueber. Marker
// werden ueber den NetBox-Location-Namen mit dataStore.locations verknuepft
// (exakter Name oder Nummern-Praefix wie "000 - Foyer") und faerben sich nach
// Geraete-Status; Klick oeffnet die Geraete-Tabelle der Location (wie im
// Rooms-View). Herkunft der Daten: mediensteuerung-dev/gebaeudeplan/README.md

const VIEWBOX_PAD = 20

const floorViewBox = (idx: number) => {
  const { x, y, w, h } = PLAN_FLOORS[idx].bbox
  return `${x - VIEWBOX_PAD} ${y - VIEWBOX_PAD} ${w + 2 * VIEWBOX_PAD} ${
    h + 2 * VIEWBOX_PAD
  }`
}

// Nur die aktive Etagen-Gruppe zeigen und den Ausschnitt darauf setzen
const applyFloor = (svg: SVGSVGElement, idx: number) => {
  PLAN_FLOORS.forEach((f, i) => {
    const group = svg.querySelector(
      `#${CSS.escape(f.id)}`,
    ) as SVGGElement | null
    if (group) {
      group.style.display = i === idx ? '' : 'none'
    }
  })
  svg.setAttribute('viewBox', floorViewBox(idx))
}

// Plan-SVG einmal laden, auch wenn mehrere Kacheln geoeffnet werden;
// Fehlschlaege nicht cachen, sonst bleibt jede spaetere Kachel haengen
let planSvgPromise: Promise<string> | null = null
const loadPlanSvg = () => {
  if (!planSvgPromise) {
    planSvgPromise = fetch(planSvgUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`gebaeudeplan.svg: HTTP ${res.status}`)
        }
        return res.text()
      })
      .catch(err => {
        planSvgPromise = null
        throw err
      })
  }
  return planSvgPromise
}

const statusFill = (theme, isOnline: number | null) => {
  if (isOnline === null) return theme.palette.grey[700]
  return {
    [-1]: theme.palette.grey[600],
    0: theme.palette.error.dark,
    1: theme.palette.warning.dark,
    2: theme.palette.success.dark,
  }[isOnline]
}

const Marker = observer<{
  room: PlanRoom
  location: any | null
  onOpen: (location: any) => void
}>(({ room, location, onOpen }) => {
  const theme = useTheme()
  const isOnline = location ? location.status.is_online : null
  const width = Math.max(58, room.number.length * 14 + 22)
  const height = 42
  const title = [
    room.name ? `${room.number} · ${room.name}` : room.number,
    location
      ? `NetBox: ${location.data.name}${
          location.data.description ? ` — ${location.data.description}` : ''
        }`
      : 'keine NetBox-Location zugeordnet',
  ].join('\n')

  return (
    <g
      onClick={location ? () => onOpen(location) : undefined}
      style={{ pointerEvents: 'auto' }}
      cursor={location ? 'pointer' : 'default'}
      opacity={location ? 1 : 0.5}
    >
      <title>{title}</title>
      <rect
        x={room.x - width / 2}
        y={room.y - height / 2}
        width={width}
        height={height}
        rx={height / 2}
        fill={statusFill(theme, isOnline)}
        stroke="#fff"
        strokeWidth={1.5}
      />
      <text
        x={room.x}
        y={room.y}
        dy="0.35em"
        textAnchor="middle"
        fill="#fff"
        style={{
          font: '600 24px system-ui, sans-serif',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {room.number}
      </text>
    </g>
  )
})

const FloorPlan = ({ path }) => {
  const { dataStore } = useStores()
  const { mosaicActions } = useContext(MosaicContext)
  const hostRef = useRef<HTMLDivElement>(null)
  const [svgReady, setSvgReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [floorIdx, setFloorIdx] = useState(1) // EG
  // aktueller Wert fuer den async Lade-Callback (User kann vor Abschluss wechseln)
  const floorIdxRef = useRef(floorIdx)
  floorIdxRef.current = floorIdx

  const floor = PLAN_FLOORS[floorIdx]
  const viewBox = useMemo(() => floorViewBox(floorIdx), [floorIdx])

  const floorRooms = useMemo(
    () => PLAN_ROOMS.filter(room => room.floor === floor.id),
    [floor.id],
  )

  // Raumnummer -> NetBox-Location: exakter Name zuerst, sonst Nummern-Praefix
  // ("000 - Foyer"). Buchstaben-Raeume (Garderoben A-D) nur ueber exakten Namen.
  const roomLocations = useMemo(() => {
    const byName: Record<string, any> = {}
    const byPrefix: Record<string, any> = {}
    values(dataStore.locations).forEach((location: any) => {
      const name: string = location.data.name
      byName[name] = location
      const prefix = name.match(/^(-?\d{3})\b/)?.[1]
      if (prefix && !byPrefix[prefix]) {
        byPrefix[prefix] = location
      }
    })
    const map: Record<string, any> = {}
    PLAN_ROOMS.forEach(room => {
      const match = byName[room.number] ?? byPrefix[room.number]
      if (match) {
        map[`${room.floor}::${room.number}`] = match
      }
    })
    return map
  }, [dataStore.locations])

  useEffect(() => {
    let cancelled = false
    loadPlanSvg()
      .then(text => {
        if (cancelled || !hostRef.current) return
        hostRef.current.innerHTML = text
        const svg = hostRef.current.querySelector('svg')
        if (!svg) throw new Error('kein <svg>-Element in der Antwort')
        svg.removeAttribute('width')
        svg.removeAttribute('height')
        svg.style.width = '100%'
        svg.style.height = '100%'
        svg.style.display = 'block'
        // Etage sofort anwenden, nicht erst im Effect nach dem Re-Render -
        // sonst blitzt einen Frame lang das ganze Artboard mit allen Etagen auf
        applyFloor(svg, floorIdxRef.current)
        setSvgReady(true)
      })
      .catch(err => setError(String(err)))
    return () => {
      cancelled = true
    }
  }, [])

  // Etagenwechsel nach dem Laden
  useEffect(() => {
    if (!svgReady) return
    const svg = hostRef.current?.querySelector('svg')
    if (svg) {
      applyFloor(svg, floorIdx)
    }
  }, [svgReady, floorIdx])

  const openLocation = useCallback(
    location => {
      mosaicActions.replaceWith(
        [],
        addToLargest({
          currentNode: mosaicActions.getRoot(),
          newNode: `location_${location.id}`,
        }),
      )
    },
    [mosaicActions],
  )

  return (
    <MosaicWindow title="Floor Plan" path={path}>
      <Paper
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ padding: '.5rem', flexShrink: 0 }}>
          <ButtonGroup size="small">
            {PLAN_FLOORS.map((f, i) => (
              <Button
                key={f.id}
                variant={i === floorIdx ? 'contained' : 'outlined'}
                onClick={() => setFloorIdx(i)}
              >
                {f.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            minHeight: 0,
            // Der Plan ist fuer hellen Untergrund gestaltet (schwarze Konturen)
            backgroundColor: '#fff',
          }}
        >
          <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
          <svg
            viewBox={viewBox}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {svgReady
              ? floorRooms.map(room => (
                  <Marker
                    key={room.number}
                    room={room}
                    location={
                      roomLocations[`${room.floor}::${room.number}`] ?? null
                    }
                    onOpen={openLocation}
                  />
                ))
              : null}
          </svg>
          {error ? (
            <Typography color="error" sx={{ padding: '1rem' }}>
              Gebäudeplan konnte nicht geladen werden: {error}
            </Typography>
          ) : null}
        </Box>
      </Paper>
    </MosaicWindow>
  )
}

export default observer(FloorPlan)
