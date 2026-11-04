export function alignNodesByCenter(nodes, rfInstance, direction = 'horizontal') {
  const internals = rfInstance.getNodes()

  // Finn midtpunktene
  const centers = internals.map(n => {
    const width = n.measured?.width ?? 0
    const height = n.measured?.height ?? 0

    return {
      id: n.id,
      centerX: n.position.x + width / 2,
      centerY: n.position.y + height / 2,
      width,
      height
    }
  })

  if (direction === 'horizontal') {
    // Finn gjennomsnittlig midtpunkt i Y
    const avgY = centers.reduce((a, c) => a + c.centerY, 0) / centers.length

    return nodes.map(n => {
      const c = centers.find(x => x.id === n.id)
      return {
        ...n,
        position: {
          x: n.position.x,
          y: avgY - c.height / 2
        }
      }
    })
  }

  if (direction === 'vertical') {
    const avgX = centers.reduce((a, c) => a + c.centerX, 0) / centers.length

    return nodes.map(n => {
      const c = centers.find(x => x.id === n.id)
      return {
        ...n,
        position: {
          x: avgX - c.width / 2,
          y: n.position.y
        }
      }
    })
  }

  return nodes
}
