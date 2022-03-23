import appConfig from '../../configuration/appConfig'
import theme from '../../configuration/theme'
import Drawable from './Drawable'

// Facil acesso
const { pixelsPerKilometer } = appConfig

const { streetWidth, streetColorSlowest } = theme

// Define um vertice
export default class Vertex extends Drawable {
  static getSquaredDistance(vertexA, vertexB) {
    const xDistance = Math.pow(vertexA.x - vertexB.x, 2)
    const yDistance = Math.pow(vertexA.y - vertexB.y, 2)

    return xDistance + yDistance
  }

  // Fornece a distancia no mapa entre dois vertices
  static getDistance(vertexA, vertexB) {
    return Math.sqrt(Vertex.getSquaredDistance(vertexA, vertexB))
  }

  // Converte de quilometros para pixels, mas tambem centraliza coordenada (0,0) no centro do mapa
  static realToMap({ x, y }) {
    return {
      x: x * pixelsPerKilometer + window.innerWidth / 2,
      y: y * pixelsPerKilometer + window.innerHeight / 2,
    }
  }

  // Armazena referencia das arestas que saem deste veretice
  sourceOf = []

  // Armazena referencia das arestas que chegam deste veretice
  destinationOf = []

  constructor(id, realX, realY, isAlreadyConverted = false) {
    // Se necessario, converte os valores reais de coordenada para valores de mapa
    const { x, y } = isAlreadyConverted
      ? { x: realX, y: realY }
      : Vertex.realToMap({ x: realX, y: realY })

    // Invoca construtor pai
    super(id, { x, y })
  }

  // Se desenha
  draw(drawer) {
    // Desenha um arco em sua posicao
    const { fillArc } = drawer.drawWith({ style: streetColorSlowest })

    fillArc(this, streetWidth / 2)
  }
}
