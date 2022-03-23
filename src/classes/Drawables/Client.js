import Drawable from './Drawable'
import Map from '../Map'
import theme from '../../configuration/theme'

const { clientHoverGrow } = theme

// Define um cliente
export default class Client extends Drawable {
  constructor(id, location, destination) {
    // Invoca construtor pai
    super(id, { ...location, destination })

    // Define uma rotacao aleatoria
    this.rotation = Math.random() * 360

    // Pega uma das 3 imagens
    this.image = Map.instance.clientImage[Math.floor(Math.random() * 3)]

    // O atual scale da imagem
    this.scale = 1

    // Se o mouse estiver proximo, aumenta o tamanho
    this.animate({
      property: 'scale',
      min: 1,
      max: clientHoverGrow,
      condition: () => this.distanceFromMouse < this.image.width + 5,
    })
  }

  draw(drawer) {
    const { drawImage } = drawer.drawWith()

    drawImage(this.image, this, this.rotation - 90, this.scale)
  }
}
