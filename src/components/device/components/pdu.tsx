import React, { useMemo, memo } from 'react'
import { Mermaid, slugId, quoteLabel } from '../../mermaid-wrapper'

type MermaidNode = {
  nodeId: string
  nodeName: string
}

// Real NetBox names (spaces, parentheses, dots, dashes, umlauts, ...) break
// the mermaid parser with "Syntax error in text" when used as ids. Ids are
// therefore built from the numeric NetBox primary keys only; the raw names go
// into quoted labels (escaping contract: slugId/quoteLabel in mermaid-wrapper).
const nodeLine = ({ nodeId, nodeName }: MermaidNode) =>
  `${nodeId}[${quoteLabel(nodeName)}]`

const makePowerPortId = ({ id }) => `powerPort_${slugId(id)}`
// Feed id from the PowerFeed primary key — globally unique, so two feeds
// whose NAMES differ only in non-[A-Za-z0-9_] chars ("L1.2" vs "L1-2")
// cannot slug-collide into one merged node.
const makePowerFeedId = ({ id }) => `powerFeed_${slugId(id)}`

const PDU = ({ name: deviceName, power_ports = [] }) => {
  // Single pass over power_ports × link_peers: PSU nodes, panels (keyed by
  // the numeric panel id so two panels sharing a display name cannot
  // collide) with their feed nodes, and one edge per (feed -> power port)
  // pair. Ports without link peers and peers without a panel simply
  // contribute no feeds/edges.
  const { psus, panels, edges } = useMemo(() => {
    const psus: MermaidNode[] = []
    const panels: Record<string, { name: string; feeds: MermaidNode[] }> = {}
    const edges: Array<[string, string]> = []
    const seenFeeds = new Set<string>()
    power_ports.forEach(({ id, name, label, link_peers = [] }) => {
      const portId = makePowerPortId({ id })
      psus.push({
        nodeId: portId,
        nodeName: `${name ?? ''} ${label ?? ''}`.trim(),
      })
      link_peers.forEach((peer) => {
        const panel = peer?.power_panel
        if (!panel) return
        const key = String(panel.id ?? panel.name)
        if (!panels[key]) {
          panels[key] = { name: String(panel.name ?? key), feeds: [] }
        }
        const feedId = makePowerFeedId(peer)
        if (!seenFeeds.has(feedId)) {
          seenFeeds.add(feedId)
          panels[key].feeds.push({
            nodeId: feedId,
            nodeName: `Feed ${peer.name}`,
          })
        }
        edges.push([feedId, portId])
      })
    })
    return { psus, panels, edges }
  }, [power_ports])

  const content = useMemo(() => {
    const panelBlocks = Object.entries(panels)
      .map(
        ([key, { name, feeds }]) => `subgraph panel_${slugId(key)}[${quoteLabel(name)}]
  ${feeds.map(nodeLine).join('\n  ')}
  end`,
      )
      .join('\n  ')
    return `flowchart TD
  subgraph device_root[${quoteLabel(deviceName)}]
  ${psus.map(nodeLine).join('\n  ')}
  end
  ${panelBlocks}
  ${edges.map(([from, to]) => `${from} --> ${to}`).join('\n  ')}
`
  }, [panels, psus, edges, deviceName])

  return <Mermaid>{content}</Mermaid>
}

export default memo(PDU)
