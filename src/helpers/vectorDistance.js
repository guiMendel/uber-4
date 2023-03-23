import { cos, sin } from './trigonometry'

export function getSquaredDistance(vertexA, vertexB) {
  const xDistance = Math.pow(vertexA.x - vertexB.x, 2)
  const yDistance = Math.pow(vertexA.y - vertexB.y, 2)

  return xDistance + yDistance
}

// Fornece a distancia no mapa entre dois vertices
export function getDistance(vertexA, vertexB) {
  return Math.sqrt(getSquaredDistance(vertexA, vertexB))
}

export function displacePoint(point, displacement, angle) {
  return {
    x: point.x + sin(angle + 90) * displacement,
    y: point.y + cos(angle + 90) * displacement,
  }
}

export function angleBetween(pointA, pointB) {
  return (
    -(Math.atan((pointB.y - pointA.y) / (pointB.x - pointA.x)) * 180) /
      Math.PI +
    (pointB.x < pointA.x ? 180 : 0)
  )
}

// Retorna as novas coordenadas de um ponto q se deslocou de source ate destination, mas nao se deslocou mais que movementLimit
export function moveTowards(source, destination, movementLimit) {
  if (getDistance(source, destination) <= movementLimit)
    return { x: destination.x, y: destination.y }

  return displacePoint(source, movementLimit, angleBetween(source, destination))
}
