import Drawable from './Drawable'
import Map from '../Map'
import theme from '../../configuration/theme'
import IO from '../IO'

const {
  clientHoverGrow,
  selectedClientColor,
  selectedClientRadius,
  clientDestinationColor,
  clientDestinationRadius,
} = theme

// Define um cliente
export default class Client extends Drawable {
  // Armazena referencia d equal cliente esta selecionado
  static #selected = null

  // Listeners
  static listeners = { select: [] }

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

  static setup() {
    // Deseleciona cliente no cancel
    IO.addEventListener('cancel', () => (this.selected = null))
  }

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
      if (this.isHovered) Client.selected = this
    })
  }

  draw(drawer) {
    // Pega a transparencia do highlight em hex
    let opacityHex = Math.floor(this.highlightOpacity * 255).toString(16)
    if (opacityHex.length == 1) opacityHex = '0' + opacityHex

    const { drawImage, fillStrokeArc } = drawer.drawWith({
      fillStyle: selectedClientColor + opacityHex,
      strokeStyle: '#ffffff' + opacityHex,
      lineWidth: 5,
    })

    // Desenha um highlight, que sera transparente se n estiver selecionado
    fillStrokeArc(this, selectedClientRadius)

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
