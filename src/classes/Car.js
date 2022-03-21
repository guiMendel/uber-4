import Drawable from './Drawable'
import Map from './Map'

// Define os carros
export default class Car extends Drawable {
  constructor(id, edge, realX, realY) {
    // Dada a posicao inicial e aresta, descobrimos em que parte da rua o carro esta, e com isso qual a real posicao inicial dele
    // const [x, y] = edge.getProjectionCoordinates(realX, realY)

    // Invoca construtor pai
    // super(id, { x, y, edge })
    super(id, { x: 50, y: 50, edge })

    // Pega a imagem do carro
    this.carImage = Map.instance.carImage
  }

  draw(context) {
    console.log(42)

    context.drawImage(
      this.carImage,
      this.x,
      this.y,
      this.carImage.width,
      this.carImage.height
    )
  }
}
