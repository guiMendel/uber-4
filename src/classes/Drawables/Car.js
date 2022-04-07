import Drawable from './Drawable'
import Map from '../Map'
import theme from '../../configuration/theme'
import Client from './Client'
import IO from '../IO'
import { getDistance } from '../../helpers/vectorDistance'
import { cos, sin } from '../../helpers/trygonometry'

const { highlightColor, clientHoverGrow } = theme

const cancelCarSelect = 'car-select-cancel'

// Define os carros
export default class Car extends Drawable {
  // Armazena referencia de qual carro esta selecionado
  static #selected = null

  // Listeners
  static listeners = { select: [] }

  static get selected() {
    return this.#selected
  }

  static set selected(value) {
    // Adiciona um cancel callback se nao tinha um carro selecionado antes
    if (value != null && this.#selected == null) {
      IO.addCancelCallback(cancelCarSelect, () => (this.selected = null))
    }

    // Se estiver desselecionando, remove
    else if (value == null) {
      IO.removeCancelCallback(cancelCarSelect)
    }

    this.#selected = value
    this.raiseEvent('select', value)
  }

  get isHovered() {
    return this.distanceFromMouse < this.carImage.height + 3
  }

  get isSelected() {
    return this == Car.selected
  }

  // Caso o carro estava no estado hovered na ultima iteracao
  wasHovered = false

  static setup() {
    // Quando nao estiver mais no modo cliente, desseleciona
    Map.addEventListener('activateinteractionclass', ({ value, oldValue }) => {
      if (value != oldValue && oldValue == Client) this.selected = null
    })
  }

  constructor(id, edge, realX, realY) {
    // Dada a posicao inicial e aresta, descobrimos em que parte da rua o carro esta, e com isso qual a real posicao inicial dele
    const [x, y] = edge.getProjectionCoordinates({ x: realX, y: realY })

    // console.log(`Original: ${realX}, ${realY}\nNew: ${x}, ${y}\n\n`)

    // Invoca construtor pai
    super(id, { x, y, edge })
    // super(id, { x: realX, y: realY, edge })

    // Registra na aresta
    edge.cars[this.id] = this

    this.onDestroy.push(() => this.edge.cars && delete this.edge.cars[this.id])

    // Pega a imagem do carro
    this.carImage = Map.instance.carImage

    // O atual scale da imagem
    this.scale = 1

    // Em que parte dda aresta esta
    this.edgeProgress = getDistance(this, edge.source) / edge.mapDistance

    // Se o mouse estiver proximo E um cliente estiver selecionado, aumenta o tamanho
    this.animate({
      property: 'scale',
      min: 1,
      max: clientHoverGrow,
      condition: () => Client.selected != null && this.isHovered,
    })

    const handleLeftClick = () => {
      // Se estiver em hover E um cliente estiver selecionado, seleciona
      if (Client.selected != null && this.isHovered) {
        Car.selected = this
      }
    }

    // Observa cliques
    IO.addEventListener('leftclick', handleLeftClick)

    this.onDestroy.push(() =>
      IO.removeEventListener('leftclick', handleLeftClick)
    )
  }

  draw(drawer) {
    const { drawImage, strokeArc } = drawer.drawWith({
      style: highlightColor,
      lineWidth: 5,
    })

    // Atualiza o cursor
    if (this.wasHovered && (!this.isHovered || Client.selected == null)) {
      this.wasHovered = false
      Map.removeCursor('pointer')
    } else if (!this.wasHovered && this.isHovered && Client.selected != null) {
      this.wasHovered = true
      Map.setCursor('pointer')
    }

    // Desenha um highlight, se estiver selecionado
    if (this.isSelected) strokeArc(this, this.carImage.height / 2 + 5)

    drawImage(this.carImage, this, this.edge.angle - 90, this.scale)
  }

  // Se reposiciona na aresta
  fixPosition() {
    const distanceToSource = this.edgeProgress * this.edge.mapDistance

    this.x = this.edge.source.x + distanceToSource * cos(this.edge.angle)
    this.y = this.edge.source.y - distanceToSource * sin(this.edge.angle)
  }
}
