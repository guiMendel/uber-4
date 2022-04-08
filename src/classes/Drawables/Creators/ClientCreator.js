import theme from '../../../configuration/theme'
import IO from '../../IO'
import Map from '../../Map'
import Client from '../Client'
import Creator from './Creator'

const { highlightColor, clientDestinationRadius } = theme

const eraseClientsToken = 'erase-clients'

// Classe que permite criar novos clientes
export default class ClientCreator extends Creator {
  // The next client to be created
  #nextCreateClient = null

  // Reflete o estado do botao de apagar clientes
  eraseClients = { isActive: false, set: null }

  constructor() {
    super()

    // Ouve botao de apagar clientes
    IO.addButtonListener('delete-clients', ({ value, setValue }) => {
      // Inicia o modo apagar clientes

      // Se ja possui um set
      if (this.eraseClients.set != null) this.eraseClients.set(value)
      // Do contrario, inicializa o set
      else {
        IO.addCancelCallback(eraseClientsToken, () =>
          this.eraseClients.set(false)
        )

        this.eraseClients.isActive = value
      }

      this.eraseClients.set = (newValue) => {
        if (newValue == false && this.eraseClients.isActive) {
          IO.removeCancelCallback(eraseClientsToken)
        } else if (newValue == true && this.eraseClients.isActive == false) {
          IO.addCancelCallback(eraseClientsToken, () =>
            this.eraseClients.set(false)
          )
        }

        this.eraseClients.isActive = newValue
        setValue(newValue)
      }
    })
  }

  onDraw(drawer) {
    const { drawImage, fillArc } = drawer.drawWith({
      opacity: 0.5,
      style: highlightColor,
    })

    // No modo apagar, desenha diferente
    if (this.eraseClients.isActive) {
      return
    }

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

    if (this.eraseClients.set) this.eraseClients.set(false)
  }

  handleClick(position) {
    if (this.#nextCreateClient == null) return

    // No modo apagar, nao faz nada. O comportamento de apagar esta na classe do cliente
    if (this.eraseClients.isActive) return

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
