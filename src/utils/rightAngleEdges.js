//
// rightAngleEdges.js
// Automatisk vinkelrett edge-layout for React Flow
//

// Finn hvilken side av noden som er nærmest et punkt
function getClosestSide(node, targetPos) {
  const dx = targetPos.x - node.position.x
  const dy = targetPos.y - node.position.y

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left'
  } else {
    return dy > 0 ? 'bottom' : 'top'
  }
}

// Map fra side → handle-id
const handleMap = {
  left:  'in-left',
  right: 'in-right',
  top:   'in-top',
  bottom:'in-bottom'
}

const handleMapOut = {
  left:  'out-left',
  right: 'out-right',
  top:   'out-top',
  bottom:'out-bottom'
}

// Lag automatisk vinkelrett edge
export function makeRightAngleEdges(nodes, edges) {
  return edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)

    if (!sourceNode || !targetNode) return edge

    // Finn hvilken side av source som peker mot target
    const sourceSide = getClosestSide(sourceNode, targetNode.position)
    const targetSide = getClosestSide(targetNode, sourceNode.position)

    return {
      ...edge,
      type: 'straight', // rette 90°-vinkler
      sourceHandle: handleMapOut[sourceSide],
      targetHandle: handleMap[targetSide],
      markerEnd: {
        type: 'arrowclosed',
        width: 30,
        height: 30,
        color: '#222'
      }
    }
  })
}
