import theme from '../../../configuration/theme'
import IO from '../../IO'
import Map from '../../Map'
import Client from '../Client'
import Creator from './Creator'

const { highlightColor, clientDestinationRadius } = theme

// Classe que permite criar novos clientes
export default class ClientCreator extends Creator {
  // The next client to be created
  #nextCreateClient = null

  onDraw(drawer) {
    const { drawImage, fillArc } = drawer.drawWith({
      opacity: 0.5,
      style: highlightColor,
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

  onCancel() {
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
}
