import delay from '../helpers/delay'
import theme from '../configuration/theme'
import appConfig from '../configuration/appConfig'
import Vertex from './Vertex'
import Edge from './Edge'

// Extrai valores uteis
const { mapBackground, streetColor, streetWidth } = theme

// Classe que governa o mapa, os desenhos do mapa e suas atualizacoes
export default class Map {
  constructor(canvasContext) {
    // Armazena o contexto para desenhar
    this.context = canvasContext

    // Inica as iteracoes
    const start = async () => {
      while (true) {
        // Renderiza uma frame
        this.renderFrame()

        // Espera o tempo de fps
        await delay(1 / appConfig.maxFramesPerSecond)
      }
    }

    start()
  }

  renderFrame() {
    // Limpa desenhos e carrega background
    this.context.fillStyle = mapBackground
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight)

    // Renderiza os vertices e arestas
    this.renderGraph()
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
}
