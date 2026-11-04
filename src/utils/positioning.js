//
// positioning.js
// Komplett modul for relativ nodeplassering i React Flow
//

// ---------------------------------------------------------
// 1. Enkel relativ plassering (x + offsetX, y + offsetY)
// ---------------------------------------------------------
export function placeRelativeTo(baseNode, offsetX, offsetY) {
  return {
    x: baseNode.position.x + offsetX,
    y: baseNode.position.y + offsetY
  }
}

// ---------------------------------------------------------
// 2. Plassering basert på node-størrelse
//    (f.eks. én nodebredde til høyre)
// ---------------------------------------------------------
export function placeRelativeToNode(baseNode, direction, distance = 1) {
  const width = baseNode.style?.width || 200
  const height = baseNode.style?.height || 200

  switch (direction) {
    case 'right':
      return { x: baseNode.position.x + width * distance, y: baseNode.position.y }
    case 'left':
      return { x: baseNode.position.x - width * distance, y: baseNode.position.y }
    case 'down':
      return { x: baseNode.position.x, y: baseNode.position.y + height * distance }
    case 'up':
      return { x: baseNode.position.x, y: baseNode.position.y - height * distance }
    default:
      return baseNode.position
  }
}

// ---------------------------------------------------------
// 3. Diamant-spesifikk plassering
//    (tar hensyn til bounding-box og rotasjon)
// ---------------------------------------------------------
export function placeRelativeToDiamond(baseNode, direction, gap = 80) {
  const size = 200 // diamantens bredde/høyde før rotasjon

  switch (direction) {
    case 'right':
      return { x: baseNode.position.x + size + gap, y: baseNode.position.y }
    case 'left':
      return { x: baseNode.position.x - size - gap, y: baseNode.position.y }
    case 'down':
      return { x: baseNode.position.x, y: baseNode.position.y + size + gap }
    case 'up':
      return { x: baseNode.position.x, y: baseNode.position.y - size - gap }
    default:
      return baseNode.position
  }
}

// ---------------------------------------------------------
// 4. Auto-layout: horisontal rad
// ---------------------------------------------------------
export function layoutRow(nodes, startX, startY, spacing = 250) {
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: startX + index * spacing,
      y: startY
    }
  }))
}

// ---------------------------------------------------------
// 5. Auto-layout: vertikal kolonne
// ---------------------------------------------------------
export function layoutColumn(nodes, startX, startY, spacing = 250) {
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: startX,
      y: startY + index * spacing
    }
  }))
}

// ---------------------------------------------------------
// 6. Auto-layout: trestruktur (parent → children)
// ---------------------------------------------------------
export function layoutTree(parentNode, children, gapX = 250, gapY = 250) {
  const baseX = parentNode.position.x
  const baseY = parentNode.position.y

  const totalWidth = (children.length - 1) * gapX
  const startX = baseX - totalWidth / 2

  return children.map((child, index) => ({
    ...child,
    position: {
      x: startX + index * gapX,
      y: baseY + gapY
    }
  }))
}
