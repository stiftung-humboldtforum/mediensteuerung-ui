import React from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'

/**
 * Error boundary around a single Mosaic tile.
 *
 * Why this exists: the open layout (which tiles are visible) is persisted to
 * localStorage under the key `mosaic` (see containers/main.tsx). If a tile's
 * render throws, React tears down the whole tree — the entire app looks dead —
 * and because the crashing tile is still in the persisted layout, every reload
 * re-opens it and crashes again. There is no way out of that loop from the UI.
 *
 * This boundary contains the blast radius to the one tile: the rest of the app
 * keeps working, and the "Diesen View schließen" button removes the tile from
 * the layout (via onRemove, which updates the mosaic tree + re-saves it), so the
 * broken view is gone on the next reload too.
 *
 * Must be a class component — React has no hook-based error boundary. It uses
 * only mosaic's public renderTile API; mosaic itself is untouched and stays
 * upgradable.
 */
interface TileErrorBoundaryProps {
  /** Mosaic node id of the wrapped tile (e.g. 'devices', 'tag_12'). */
  tileId: string
  /** Remove this tile from the layout. Wired to the mosaic tree in main.tsx. */
  onRemove: () => void
  children: React.ReactNode
}

interface TileErrorBoundaryState {
  error: Error | null
}

class TileErrorBoundary extends React.Component<
  TileErrorBoundaryProps,
  TileErrorBoundaryState
> {
  state: TileErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): TileErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep the crash visible for debugging instead of swallowing it silently.
    console.error(`Tile "${this.props.tileId}" crashed:`, error, info)
  }

  private retry = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) {
      return this.props.children
    }

    return (
      <Paper
        square
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 3,
          textAlign: 'center',
          overflow: 'auto',
        }}
      >
        <Typography variant="h6" color="error">
          Dieser View konnte nicht geladen werden
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          {this.props.tileId}: {error.message || 'Unbekannter Fehler'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={this.retry}>
            Erneut versuchen
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={this.props.onRemove}
          >
            Diesen View schließen
          </Button>
        </Box>
      </Paper>
    )
  }
}

export default TileErrorBoundary
