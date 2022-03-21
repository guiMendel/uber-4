import Drawable from './Drawable'
import Map from './Map'

// Define os carros
export default class Car extends Drawable {
  constructor(id, edge, realX, realY) {
    // Dada a posicao inicial e aresta, descobrimos em que parte da rua o carro esta, e com isso qual a real posicao inicial dele
    const [x, y] = edge.getProjectionCoordinates(realX, realY)

    console.log(`Original: ${realX}, ${realY}\nNew: ${x}, ${y}\n\n`)

    // Invoca construtor pai
    super(id, { x, y, edge })
    // super(id, { x: realX, y: realY, edge })

    // Pega a imagem do carro
    this.carImage = Map.instance.carImage
  }

  draw(context) {
    context.drawImage(
      this.carImage,
      this.x,
      this.y,
      this.carImage.width,
      this.carImage.height
    )
  }
}
