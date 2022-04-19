import appConfig from '../../configuration/appConfig'
import theme from '../../configuration/theme'
import Heap from '../DataStructures/Heap'
import SortProperties from '../SortProperties'
import Drawable from './Drawable'

// Facil acesso
const { pixelsPerKilometer } = appConfig

const { streetWidth, streetColorSlowest } = theme

// Define um vertice
export default class Vertex extends Drawable {
  // Guarda os vertices ordenados pelas coordenada
  static sortedCoords = new SortProperties({
    x: (v1, v2) => v1.x < v2.x,
    y: (v1, v2) => v1.y < v2.y,
  })

  // Converte de quilometros para pixels, mas tambem centraliza coordenada (0,0) no centro do mapa
  static realToMap({ x, y }) {
    return {
      x: x * pixelsPerKilometer,
      y: y * pixelsPerKilometer,
    }
  }

  // Armazena referencia das arestas que saem deste veretice
  sourceOf = {}

  // Armazena referencia das arestas que chegam deste veretice
  destinationOf = {}

  get edges() {
    return [
      ...Object.values(this.sourceOf),
      ...Object.values(this.destinationOf),
    ]
  }

  constructor(id, ...properties) {
    // Se necessario, converte os valores reais de coordenada para valores de mapa
    const { x, y } = Vertex.nameProperties(...properties)

    // Invoca construtor pai
    super(id, { x, y })

    // Adiciona nas listas ordenadas por coordenada
    Vertex.sortedCoords.register(this)
    this.onDestroy.push(() => Vertex.sortedCoords.remove(this))
  }

  // Se desenha
  draw(drawer, color) {
    // Desenha um arco em sua posicao
    const { fillArc } = drawer.drawWith({ style: color ?? streetColorSlowest })

    fillArc(this, streetWidth / 2)
  }

  static nameProperties(realX, realY, isAlreadyConverted = false) {
    // Se necessario, converte os valores reais de coordenada para valores de mapa
    return isAlreadyConverted
      ? { x: realX, y: realY }
      : Vertex.realToMap({ x: realX, y: realY })
  }

  static eraseAllInstances() {
    this.sortedCoords.clear()
  }
}
