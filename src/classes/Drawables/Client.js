import Drawable from './Drawable'
import Map from '../Map'
import theme from '../../configuration/theme'
import IO from '../IO'
import RouteHighlighter from './RouteHighlighter'

const {
  clientHoverGrow,
  highlightColor: selectedClientColor,
  selectedClientRadius,
  clientDestinationColor,
  clientDestinationRadius,
} = theme

// Define um cliente
export default class Client extends Drawable {
  // Armazena referencia d equal cliente esta selecionado
  static #selected = null

  // Listeners
  static listeners = { select: [], routeselect: [] }

  static get selected() {
    return this.#selected
  }

  static set selected(value) {
    this.#selected = value
    this.raiseEvent('select', value)
  }

  get isHovered() {
    return this.distanceFromMouse < this.image.width + 3
  }

  get isSelected() {
    return this == Client.selected
  }

  // A rota selecionada para este cliente
  #selectedRoute = null

  get selectedRoute() {
    return this.#selectedRoute
  }

  set selectedRoute(value) {
    this.#selectedRoute = value
    Client.raiseEvent('routeselect', { client: this, route: value })
  }

  static setup() {
    // Deseleciona cliente no cancel
    IO.addEventListener('cancel', () => {
      if (Map.activeInteractionClass == Client)
        Map.activeInteractionClass = null
      this.selected = null
    })

    // Mantem o cursor atualizado
    Map.addEventListener('activateinteractionclass', ({ value, oldValue }) => {
      if (value != oldValue && oldValue == Client) this.selected = null
    })
  }

  // Caso o cliente estava no estado hovered na ultima iteracao
  wasHovered = false

  constructor(id, location, destination, image, rotation) {
    // Invoca construtor pai
    super(id, { ...location, destination })

    // Define uma rotacao aleatoria
    this.rotation = rotation ?? Math.random() * 360

    // Pega uma das 3 imagens
    this.image =
      image ?? Map.instance.clientImage[Math.floor(Math.random() * 3)]

    // O atual scale da imagem
    this.scale = 1

    // Se o mouse estiver proximo, aumenta o tamanho
    this.animate({
      property: 'scale',
      min: 1,
      max: clientHoverGrow,
      condition: () => this.isHovered,
    })

    // A atual transparencia do highlight
    this.highlightOpacity = 0
    this.animate({
      property: 'highlightOpacity',
      min: 0,
      max: 1,
      condition: () => this.isSelected,
    })

    // Observa cliques
    IO.addEventListener('leftclick', () => {
      // Se estiver em hover, seleciona
      if (this.isHovered) {
        Client.selected = this
        Map.activeInteractionClass = Client
      }
    })
  }

  draw(drawer) {
    // Antes de mais nada, desataca sua rota
    if (this.isSelected && this.selectedRoute != null) {
      RouteHighlighter.highlightRoute(this.selectedRoute, drawer)
    }

    // Atualiza o cursor
    if (this.wasHovered && !this.isHovered) {
      this.wasHovered = false
      Map.removeCursor('pointer')
    } else if (!this.wasHovered && this.isHovered) {
      this.wasHovered = true
      Map.setCursor('pointer')
    }

    // Pega a transparencia do highlight em hex
    let opacityHex = Math.floor(this.highlightOpacity * 255).toString(16)
    if (opacityHex.length == 1) opacityHex = '0' + opacityHex

    const { drawImage, strokeArc } = drawer.drawWith({
      style: selectedClientColor + opacityHex,
      lineWidth: 5,
    })

    // Desenha um highlight, que sera transparente se n estiver selecionado
    strokeArc(this, selectedClientRadius)

    drawImage(this.image, this, this.rotation - 90, this.scale)

    if (this.isSelected) {
      const { fillArc } = drawer.drawWith({
        style: clientDestinationColor,
      })

      // Desenha seu destino se selecionado
      fillArc(this.destination, clientDestinationRadius)
    }
  }
}
