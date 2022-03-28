import IO from '../IO'
import Map from '../Map'
import Drawable from './Drawable'

import pencilCursor from '../../assets/pen.cur'
import defaultCursor from '../../assets/arrow.cur'

// Classe que permite criar novos clientes
export default class ClientCreator extends Drawable {
  static #instance

  // The next client to be created
  #nextCreateClient = null

  constructor() {
    if (ClientCreator.#instance != undefined) return ClientCreator.#instance

    super(1, {})

    ClientCreator.#instance = this

    // Para de criar no cancel
    IO.addEventListener('cancel', () => {
      ClientCreator.isActive = false
      this.#nextCreateClient = null
      Map.setCursor(defaultCursor)
    })

    IO.buttons['new-client'].onTrigger(() => {
      ClientCreator.isActive = true
      Map.setCursor(pencilCursor)
    })
  }

  draw(drawer) {
    if (!ClientCreator.isActive) return

    const { drawImage } = drawer.drawWith({ opacity: 0.5 })

    drawImage(
      this.nextClient.image,
      IO.mouse.mapCoords,
      this.nextClient.rotation
    )
  }

  get nextClient() {
    if (this.#nextCreateClient != null) return this.#nextCreateClient

    this.#nextCreateClient = {
      // Define uma rotacao aleatoria
      rotation: Math.random() * 360,

      // Pega uma das 3 imagens
      image: Map.instance.clientImage[Math.floor(Math.random() * 3)],
    }

    return this.#nextCreateClient
  }

  static get isActive() {
    return Map.activeInteractionClass == this
  }

  static set isActive(value) {
    if (value) Map.activeInteractionClass = this
    else if (this.isActive) Map.activeInteractionClass = null
  }
}
