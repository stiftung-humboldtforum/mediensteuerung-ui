import React, { useEffect } from 'react'
import mermaid, { MermaidConfig } from 'mermaid'

const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: true,
  theme: 'dark',
  logLevel: 'fatal',
  securityLevel: 'loose',
  arrowMarkerAbsolute: false,
  fontFamily: 'IBM Plex Mono',
  flowchart: {
    htmlLabels: true,
    curve: 'linear',
  },
}

mermaid.initialize({ ...DEFAULT_CONFIG })

export const Mermaid = ({ children, ...rest }) => {
  useEffect(() => {
    mermaid.contentLoaded()
  }, [children])

  return (
    // key bound to the diagram source: mermaid stamps data-processed on the node
    // and skips re-rendering it, so React must remount a fresh node when the
    // content changes (e.g. PDU topology after a data-refresh).
    <div key={String(children)} {...rest} className="mermaid">
      {children}
    </div>
  )
}
