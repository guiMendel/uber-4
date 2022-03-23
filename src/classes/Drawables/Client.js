import Drawable from './Drawable'
import Map from '../Map'

// Define um cliente
export default class Client extends Drawable {
  constructor(id, location, destination) {
    // Invoca construtor pai
    super(id, { ...location, destination })

    // Define uma rotacao aleatoria
    this.rotation = Math.random() * 360

    // Pega uma das 3 imagens
    this.image = Map.instance.clientImage[Math.floor(Math.random() * 3)]
  }

  draw(drawer) {
    const { drawImage } = drawer.drawWith()

    drawImage(this.image, this, this.rotation - 90)
  }
}
