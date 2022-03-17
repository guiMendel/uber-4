import appConfig from '../configuration/appConfig'
import theme from '../configuration/theme'

// Facil acesso
const { pixelsPerKilometer } = appConfig

const { streetWidth, streetColor } = theme

// Define um vertice
export default class Vertex {
  // Um objeto que vai mapear todos os IDs de vertices para os vertices correspondentes
  static vertices = {}

  // Fornece a distancia no mapa entre dois vertices
  static getDistance(vertexA, vertexB) {
    const xDistance = Math.pow(vertexA.x - vertexB.x, 2)
    const yDistance = Math.pow(vertexA.y - vertexB.y, 2)

    return Math.sqrt(xDistance + yDistance)
  }

  // Converte de quilometros para pixels, mas tambem centraliza coordenada (0,0) no centro do mapa
  static realToMap({ x, y }) {
    return {
      x: x * pixelsPerKilometer + window.innerWidth / 2,
      y: y * pixelsPerKilometer + window.innerHeight / 2,
    }
  }

  constructor(id, realX, realY, isAlreadyConverted = false) {
    // Se necessario, converte os valores reais de coordenada para valores de mapa
    const { x, y } = isAlreadyConverted
      ? { x: realX, y: realY }
      : Vertex.realToMap({ x: realX, y: realY })

    // Se este id ja tiver sido previamente declarado
    if (Vertex.vertices[id] != undefined) {
      const existingVertex = Vertex.vertices[id]

      // Verifique que as coordenadas fornecidas coincidem. Se sim, apenas retorne o vertice preexistente
      if (existingVertex.x == x && existingVertex.y == y) return existingVertex

      throw new Error(
        `Tentativa de redefinir vertice de id "${id}". Coordenadas previamente definidas: (${existingVertex.x}, ${existingVertex.y}), novas coordenadas: (${x}, ${y})`
      )
    }

    // Coordenadas
    this.x = x
    this.y = y

    // Registrar vertice
    Vertex.vertices[id] = this
  }

  // Se desenha
  draw(context) {
    // Desenha um arco em sua posicao
    context.fillStyle = streetColor

    context.beginPath()

    context.arc(this.x, this.y, streetWidth / 2, 0, Math.PI * 2)

    context.fill()
  }
}
