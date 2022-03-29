import appConfig from '../../configuration/appConfig'
import theme from '../../configuration/theme'
import Heap from '../DataStructures/Heap'
import Drawable from './Drawable'

// Facil acesso
const { pixelsPerKilometer } = appConfig

const { streetWidth, streetColorSlowest } = theme

// Define um vertice
export default class Vertex extends Drawable {
  // Guarda todos os vertices
  static verticesSortedBy = {
    // Guarda os vertices ordenados pela coordenada x
    x: [],

    // Guarda os vertices ordenados pela coordenada y
    y: [],

    // Heap utilizado no x
    xHeap: new Heap((v1, v2) => v1.x < v2.x),

    // Heap utilizado no y
    yHeap: new Heap((v1, v2) => v1.y < v2.y),
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

    // Adiciona nos heaps
    Vertex.verticesSortedBy.xHeap.insert(this)
    Vertex.verticesSortedBy.yHeap.insert(this)

    // Atualiza os vetores ordenados
    Vertex.verticesSortedBy.x = Vertex.verticesSortedBy.xHeap.toArray()
    Vertex.verticesSortedBy.y = Vertex.verticesSortedBy.yHeap.toArray()
  }

  // Se desenha
  draw(drawer) {
    // Desenha um arco em sua posicao
    const { fillArc } = drawer.drawWith({ style: streetColorSlowest })

    fillArc(this, streetWidth / 2)
  }
}
