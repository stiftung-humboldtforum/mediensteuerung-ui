import React, { useEffect, useState } from 'react'
import mermaid, { MermaidConfig } from 'mermaid'

const DEFAULT_CONFIG: MermaidConfig = {
  // render() API only — no DOM scanning. startOnLoad:false disarms mermaid's
  // window-load listener and contentLoaded() auto-processing, so no `.mermaid`
  // node anywhere can be processed ungated.
  startOnLoad: false,
  theme: 'dark',
  logLevel: 'fatal',
  // 'strict' over 'loose': labels here are plain names (no intended HTML) and
  // no click/call directives are emitted — strict adds script-stripping on top
  // of mermaid's always-on DOMPurify pass at zero feature cost.
  securityLevel: 'strict',
  arrowMarkerAbsolute: false,
  fontFamily: 'IBM Plex Mono',
  flowchart: {
    htmlLabels: true,
    curve: 'linear',
  },
}

mermaid.initialize({ ...DEFAULT_CONFIG })

// Escaping contract for diagram AUTHORS (see pdu.tsx for usage):
// mermaid ids must stay within [A-Za-z0-9_]; free-form text (NetBox device/
// panel/feed names with spaces, parentheses, dots, umlauts, ...) belongs in
// quoted labels, which tolerate everything except the quote character.
// Exported next to the wrapper so every future diagram consumer finds them.
export const slugId = (value) => String(value ?? '').replace(/[^A-Za-z0-9_]/g, '_')
export const quoteLabel = (value) =>
  `"${String(value ?? '')
    .trim()
    .replace(/"/g, "'")}"`

// Unique target ids for mermaid.render() — DOM-global, so a module counter.
let renderSeq = 0

export const Mermaid = ({ children, ...rest }) => {
  const source = String(children)
  // Track WHICH source string succeeded/failed — not a boolean. A boolean
  // gate breaks under React batching (state can collapse back to its old
  // value within one render, so effects keyed on it never re-fire); string
  // identity makes every source change an observable update.
  const [rendered, setRendered] = useState<{ source: string; svg: string } | null>(null)
  const [failed, setFailed] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const id = `mermaid-render-${renderSeq++}`
    // mermaid.render() parses AND renders in one pass and rejects on either
    // failure — unlike the old startOnLoad/contentLoaded pipeline, where
    // render-stage errors (e.g. maxTextSize) bypassed a parse-only gate and
    // bombed the tile with mermaid's red error artwork.
    Promise.resolve()
      .then(() => mermaid.render(id, source))
      .then(({ svg }) => {
        if (alive) setRendered({ source, svg })
      })
      .catch((error) => {
        // mermaid 10.9.6 throws BEFORE removing its temp element and may have
        // drawn its error artwork into it — clean up both possible ids.
        document.getElementById('d' + id)?.remove()
        document.getElementById(id)?.remove()
        if (!alive) return
        console.error('mermaid: diagram failed to render', error, source)
        setFailed(source)
      })
    return () => {
      alive = false
    }
  }, [source])

  if (failed === source) {
    return (
      <div {...rest} style={{ opacity: 0.7, fontStyle: 'italic' }}>
        Diagram unavailable (invalid definition — see console).
      </div>
    )
  }
  if (rendered?.source !== source) {
    // Render pending: keep an empty placeholder so grid/flex parents
    // (deviceInfo's two-column grid) don't lose this cell and mis-pair the
    // following label/value cells.
    return <div {...rest} />
  }
  // The svg string comes out of mermaid's own sanitized render pass.
  return <div {...rest} dangerouslySetInnerHTML={{ __html: rendered.svg }} />
}
