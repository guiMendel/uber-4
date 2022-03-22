import Drawable from './Drawable'
import Map from './Map'

// Define um cliente
export default class Client extends Drawable {
  constructor(id, location, destination) {
    // Invoca construtor pai
    super(id, { location, destination })

    // Define uma rotacao aleatoria
    this.rotation = Math.random() * 360

    // Pega uma das 3 imagens
    this.image = Map.instance.clientImage[Math.floor(Math.random() * 3)]
  }

  draw(context) {
    // Salva o estado do contexto
    context.save()

    context.setTransform(1, 0, 0, 1, this.location.x, this.location.y)

    // Rotaciona o contexto (depois vamos desfazer isso, mas o carro continuara rotacionado)
    context.rotate((-(this.rotation - 90) * Math.PI) / 180)
    // context.rotate(Math.PI)

    context.drawImage(
      this.image,
      -this.image.width / 2,
      -this.image.height / 2,
      this.image.width,
      this.image.height
    )

    context.restore()
  }
}
