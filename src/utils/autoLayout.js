//
// autoLayout.js
// Automatisk layout for React Flow basert på edges
//

// ---------------------------------------------------------
// 1. Bygg nivåer (layers) basert på edges
// ---------------------------------------------------------
export function buildLevels(nodes, edges) {
  const levels = []
  const visited = new Set()

  // Finn røtter (noder som ikke har noen incoming edges)
  const incoming = new Map()
  nodes.forEach(n => incoming.set(n.id, 0))
  edges.forEach(e => incoming.set(e.target, (incoming.get(e.target) || 0) + 1))

  const roots = nodes.filter(n => incoming.get(n.id) === 0)

  let currentLevel = roots

  while (currentLevel.length > 0) {
    levels.push(currentLevel)
    visited.add(...currentLevel.map(n => n.id))

    const nextLevel = []

    currentLevel.forEach(node => {
      const outgoing = edges.filter(e => e.source === node.id)
      outgoing.forEach(e => {
        const targetNode = nodes.find(n => n.id === e.target)
        if (targetNode && !visited.has(targetNode.id)) {
          nextLevel.push(targetNode)
        }
      })
    })

    currentLevel = nextLevel
  }

  return levels
}

// ---------------------------------------------------------
// 2. Plasser noder automatisk i grid
// ---------------------------------------------------------
export function applyAutoLayout(levels, startX = 200, startY = 100, gapX = 300, gapY = 300) {
  const positioned = []

  levels.forEach((level, levelIndex) => {
    const totalWidth = (level.length - 1) * gapX
    const baseX = startX - totalWidth / 2
    const y = startY + levelIndex * gapY

    level.forEach((node, i) => {
      positioned.push({
        ...node,
        position: {
          x: baseX + i * gapX,
          y
        }
      })
    })
  })

  return positioned
}

// ---------------------------------------------------------
// 3. Hovedfunksjon: autoLayout(nodes, edges)
// ---------------------------------------------------------
export function autoLayout(nodes, edges, options = {}) {
  const { startX = 400, startY = 100, gapX = 300, gapY = 300 } = options

  const levels = buildLevels(nodes, edges)
  return applyAutoLayout(levels, startX, startY, gapX, gapY)
}
