import Configuration from '../../configuration/Configuration'
import SortProperties from '../SortProperties'
import Drawable from './Drawable'

// Define um vertice
export default class Vertex extends Drawable {
  static className = 'Vertex'

  // Guarda os vertices ordenados pelas coordenada
  static sortedCoords = new SortProperties({
    x: (v1, v2) => v1.x < v2.x,
    y: (v1, v2) => v1.y < v2.y,
  })

  // Converte de quilometros para pixels, mas tambem centraliza coordenada (0,0) no centro do mapa
  static realToMap({ x, y }) {
    const { pixelsPerKilometer } = Configuration.getInstance().general

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
    const { streetWidth, slowestStreetColor } =
      Configuration.getInstance().theme

    // Desenha um arco em sua posicao
    const { fillArc } = drawer.drawWith({ style: color ?? slowestStreetColor })

    fillArc(this, streetWidth / 2)
  }

  static nameProperties(realX, realY, isAlreadyConverted = false) {
    // Se necessario, converte os valores reais de coordenada para valores de mapa
    return isAlreadyConverted
      ? { x: realX, y: realY }
      : Vertex.realToMap({ x: realX, y: realY })
  }

  static resetAll() {
    super.resetAll()
    this.sortedCoords.clear()
  }
}
