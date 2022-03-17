import theme from '../configuration/theme'
import Vertex from './Vertex'

// Extrai valores uteis
const {
  streetArrowsColor,
  streetArrowHeight,
  streetArrowInterval,
  streetColor,
  streetWidth,
} = theme

// Helpers
// Trigonometry
const sin = (angle) => Math.sin(angle * (Math.PI / 180))
const cos = (angle) => Math.cos(angle * (Math.PI / 180))

// Define uma aresta
export default class Edge {
  // Um objeto que vai mapear todos os IDs de edges para as arestas correspondentes
  static edges = {}

  // Descobre a real velocidade da aresta, com base no seu comprimento e velocidade bruta
  static getMapSpeed(realDistance, mapDistance, realSpeed) {
    return (mapDistance * realSpeed) / realDistance
  }

  get mapDistance() {
    return Vertex.getDistance(this.source, this.destination)
  }

  // Se for fornecido um mapSpeed, ele eh utilizado. Se nao, usa-se os valores reais para calcular o mapSpeed
  constructor(id, source, destination, { mapSpeed, realDistance, realSpeed }) {
    // Encontra a velocidade de mapa, se ja nao estiver definida
    mapSpeed ??= Edge.getMapSpeed(realDistance, this.mapDistance, realSpeed)

    // Se este id ja tiver sido previamente declarado
    if (Edge.edges[id] != undefined) {
      const existingEdge = Edge.edges[id]

      // Verifique que a origem e destino coincidem. Se nao, erro
      if (
        existingEdge.source != source ||
        existingEdge.destination != destination
      )
        throw new Error(
          `Tentativa de redefinir aresta de id "${id}". Origem e destino previamente definidos, respectivamente: (${existingEdge.source.x}, ${existingEdge.source.y}); (${existingEdge.destination.x}, ${existingEdge.destination.y}), novos valores: (${source.x}, ${source.y}); (${destination.x}, ${destination.y})`
        )

      // Verifique que a velocidade de mapa coincide. Se nao, erro
      if (mapSpeed == existingEdge.mapSpeed)
        throw new Error(
          `Tentativa de redefinir aresta de id "${id}". Velocidade de mapa previamente definido: ${existingEdge.mapSpeed}, novo valor: ${mapSpeed}`
        )

      return existingEdge
    }

    // Saida e destino
    this.source = source
    this.destination = destination
    this.mapSpeed = mapSpeed

    // Registrar aresta
    Edge.edges[id] = this
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

  // Desenha triangulos de direcao para cada rua
  static drawStreetPointers(context) {
    // Para cada aresta
    for (const edge of Object.values(Edge.edges)) {
      // Descobre o angulo da aresta
      const edgeAngle =
        (Math.atan(
          (edge.destination.x - edge.source.x) /
            (edge.destination.y - edge.source.y)
        ) *
          180) /
          Math.PI +
        (edge.destination.y < edge.source.y ? 180 : 0)

      // A comecar da origem da aresta, desenhar flechas ao longo dela, e ir deslocando o ponto de desenho
      let displacement = 0

      // Enquanto ainda couberem flechas
      while (displacement + streetArrowHeight <= edge.mapDistance) {
        this.drawArrow(
          edge.source.x + displacement * sin(edgeAngle),
          edge.source.y + displacement * cos(edgeAngle),
          edgeAngle,
          context
        )

        // Aumenta o deslocamento
        displacement += streetArrowInterval
      }
    }
  }

  // x e y devem apontar para o centro da base do triangulo
  static drawArrow(x, y, pointAngle, context) {
    // Permite obter as coordenadas x, y desloacadas no angulo indicado, numa distancia indicada
    // Ja torna o angulo relativo ao angulo de rotacao do triangulo, e soma 90 para que 0 seja a direita
    const displacement = (amount, angle) => [
      x + amount * sin(angle + pointAngle),
      y + amount * cos(angle + pointAngle),
    ]

    context.beginPath()

    context.strokeStyle = streetArrowsColor

    context.lineWidth = streetWidth / 5

    // Comecar na extremidade esquerda da base
    context.moveTo(...displacement((streetWidth - 2) / 2, 90))

    // Linha ate a ponta do triangulo
    context.lineTo(...displacement(streetArrowHeight, 0))

    // Linha ate a extremidade direita do triangulo
    context.lineTo(...displacement((streetWidth - 2) / 2, 270))

    context.stroke()
  }
}
