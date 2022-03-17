import delay from '../helpers/delay'
import theme from '../configuration/theme'
import appConfig from '../configuration/appConfig'
import Vertex from './Vertex'
import Edge from './Edge'

// Extrai valores uteis
const {
  mapBackground,
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

// Classe que governa o mapa, os desenhos do mapa e suas atualizacoes
export default class Map {
  constructor(canvasContext) {
    // Armazena o contexto para desenhar
    this.context = canvasContext

    // Tempo pelo qual permanece ativo
    this.active = true

    // Inica as iteracoes
    const start = async () => {
      while (this.active) {
        // Renderiza uma frame
        this.renderFrame()

        // Espera o tempo de fps
        await delay(1 / appConfig.maxFramesPerSecond)
      }
    }

    start()
  }

  disable() {
    this.active = false
  }

  renderFrame() {
    // Limpa desenhos e carrega background
    this.context.fillStyle = mapBackground
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight)

    // Renderiza os vertices e arestas
    this.renderGraph()

    // Rendreiza as indicacoes de sentido das ruas
    this.drawStreetPointers()
  }

  renderGraph() {
    // Para cada vertice
    for (const vertex of Object.values(Vertex.vertices)) {
      // Desenha um arco em sua posicao
      this.context.fillStyle = streetColor

      this.context.beginPath()

      this.context.arc(vertex.x, vertex.y, streetWidth / 2, 0, Math.PI * 2)

      this.context.fill()
    }

    // Para cada aresta
    for (const edge of Object.values(Edge.edges)) {
      // Desenha uma linha do vertice origem para o vertice destino
      this.context.strokeStyle = streetColor
      this.context.lineWidth = streetWidth

      this.context.beginPath()

      this.context.moveTo(edge.source.x, edge.source.y)

      this.context.lineTo(edge.destination.x, edge.destination.y)

      this.context.stroke()
    }
  }

  // Desenha triangulos de direcao para cada rua
  drawStreetPointers() {
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
          edgeAngle
        )

        // Aumenta o deslocamento
        displacement += streetArrowInterval
      }
    }
  }

  // x e y devem apontar para o centro da base do triangulo
  drawArrow(x, y, pointAngle) {
    // Permite obter as coordenadas x, y desloacadas no angulo indicado, numa distancia indicada
    // Ja torna o angulo relativo ao angulo de rotacao do triangulo, e soma 90 para que 0 seja a direita
    const displacement = (amount, angle) => [
      x + amount * sin(angle + pointAngle),
      y + amount * cos(angle + pointAngle),
    ]

    this.context.beginPath()

    this.context.strokeStyle = streetArrowsColor

    this.context.lineWidth = 2

    // Comecar na extremidade esquerda da base
    this.context.moveTo(...displacement((streetWidth - 2) / 2, 90))

    // Linha ate a ponta do triangulo
    this.context.lineTo(...displacement(streetArrowHeight, 0))

    // Linha ate a extremidade direita do triangulo
    this.context.lineTo(...displacement((streetWidth - 2) / 2, 270))

    this.context.stroke()
  }
}
