import theme from '../configuration/theme'
import Drawable from './Drawable'
import Vertex from './Vertex'

// Extrai valores uteis
const {
  streetArrowsColor,
  streetArrowHeight,
  streetArrowInterval,
  streetColor,
  streetWidth,
} = theme

// Define uma aresta
export default class Edge extends Drawable {
  // Descobre a real velocidade da aresta, com base no seu comprimento e velocidade bruta
  static getMapSpeed(realDistance, mapDistance, realSpeed) {
    return (mapDistance * realSpeed) / realDistance
  }

  // Retorna a distancia em pixels entre source e destination
  get mapDistance() {
    return Vertex.getDistance(this.source, this.destination)
  }

  // Se for fornecido um mapSpeed, ele eh utilizado. Se nao, usa-se os valores reais para calcular o mapSpeed
  constructor(id, source, destination, { mapSpeed, realDistance, realSpeed }) {
    // Encontra a velocidade de mapa, se ja nao estiver definida
    mapSpeed ??= Edge.getMapSpeed(realDistance, this.mapDistance, realSpeed)

    // Invoca construtor pai
    super(id, { source, destination, mapSpeed })
  }

  // Se desenha
  draw(context) {
    // Desenha uma linha do vertice origem para o vertice destino
    context.strokeStyle = streetColor
    context.lineWidth = streetWidth

    context.beginPath()

    context.moveTo(this.source.x, this.source.y)

    context.lineTo(this.destination.x, this.destination.y)

    context.stroke()
  }

  // Retorna o angulo desta aresta
  get angle() {
    return (
      (Math.atan(
        (this.destination.x - this.source.x) /
          (this.destination.y - this.source.y)
      ) *
        180) /
        Math.PI +
      (this.destination.y < this.source.y ? 180 : 0)
    )
  }
}
