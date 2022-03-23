export function getSquaredDistance(vertexA, vertexB) {
  const xDistance = Math.pow(vertexA.x - vertexB.x, 2)
  const yDistance = Math.pow(vertexA.y - vertexB.y, 2)

  return xDistance + yDistance
}

// Fornece a distancia no mapa entre dois vertices
export function getDistance(vertexA, vertexB) {
  return Math.sqrt(getSquaredDistance(vertexA, vertexB))
}
