import theme from '../../configuration/theme'
import IO from '../IO'
import Map from '../Map'
import Client from './Client'
import Drawable from './Drawable'

const { clientDestinationColor, clientDestinationRadius } = theme

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
    })

    IO.buttons['new-client'].onTrigger(() => {
      ClientCreator.isActive = true
    })

    // Mantem o cursor atualizado
    Map.addEventListener('activateinteractionclass', ({ value, oldValue }) => {
      if (value == ClientCreator) Map.setCursor('pencil')
      else if (oldValue == ClientCreator) this.cancel()
    })

    // Ouve cliques
    IO.addEventListener('leftclick', (value) => this.handleClick(value))
  }

  draw(drawer) {
    if (!ClientCreator.isActive) return

    const { drawImage, fillArc } = drawer.drawWith({
      opacity: 0.5,
      style: clientDestinationColor,
    })

    // Desenha a imagem do cliente
    drawImage(
      this.nextClient.image,
      this.nextClient.x ? this.nextClient : IO.mouse.mapCoords,
      this.nextClient.rotation - 90
    )

    // Desenha o destino
    if (this.nextClient.x) {
      // Desenha seu destino se selecionado
      fillArc(IO.mouse.mapCoords, clientDestinationRadius)
    }
  }

  cancel() {
    Map.removeCursor('pencil')
    this.#nextCreateClient = null
  }

  handleClick(position) {
    if (this.#nextCreateClient == null) return

    // Se tem um cliente em preview, mas ele ainda nao tem coordenadas, confere as coordenadas a ele
    if (this.nextClient.x == null) {
      Object.assign(this.#nextCreateClient, position.map)

      return
    }

    // Se ele ja tem coordenadas, cria o cliente especificado
    new Client(
      undefined,
      this.nextClient,
      position.map,
      this.nextClient.image,
      this.nextClient.rotation
    )

    // Reinicia criacao
    this.#nextCreateClient = null
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
