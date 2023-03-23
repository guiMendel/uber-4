import Configuration from '../../../configuration/Configuration'
import IO from '../../IO'
import Map from '../../Map'
import Random from '../../Random'
import Simulation from '../../Simulation'
import Client from '../Client'
import Vertex from '../Vertex'
import Creator from './Creator'

const eraseClientsToken = 'erase-clients'
const clientPositionToken = 'client-position'

// Classe que permite criar novos clientes
export default class ClientCreator extends Creator {
  static className = 'ClientCreator'

  // The next client to be created
  #nextCreateClient = null

  // Reflete o estado do botao de apagar clientes
  eraseClients = { isActive: false, set: null }

  // Whether auto generation is on
  autoGeneration = true

  // Cooldown of client auto generation, in seconds
  clientAutoGenerateCooldown = { min: 0.5, max: 1 }

  clientResetter = null

  reset() {
    this.autoGeneration = false
    this.clientResetter()
    super.reset()
  }

  constructor() {
    super()

    // Ouve botao de apagar clientes
    const eraseCallback = ({ value, setValue }) => {
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
    }
    IO.addButtonListener('delete-clients', eraseCallback)

    // Listen to auto generation toggle
    const autoGenCallback = ({ value }) => {
      this.autoGeneration = value
    }
    IO.addButtonListener('auto-generate-clients', autoGenCallback)

    // Start client generation
    this.scheduleClientGeneration()

    this.clientResetter = () => {
      IO.removeButtonListener('delete-clients', eraseCallback)
      IO.removeButtonListener('auto-generate-clients', autoGenCallback)
    }
  }

  onDraw(drawer) {
    const { highlightColor, clientDestinationRadius } =
      Configuration.getInstance().theme

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

    IO.removeCancelCallback(clientPositionToken)
  }

  handleClick(position) {
    if (this.#nextCreateClient == null) return

    // No modo apagar, nao faz nada. O comportamento de apagar esta na classe do cliente
    if (this.eraseClients.isActive) return

    // Se tem um cliente em preview, mas ele ainda nao tem coordenadas, confere as coordenadas a ele
    if (this.nextClient.x == null) {
      Object.assign(this.#nextCreateClient, position.map)

      // Cria um cancel callback
      IO.addCancelCallback(
        clientPositionToken,
        () => (this.#nextCreateClient = null)
      )

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

  // Wait a cooldown and generate a client
  scheduleClientGeneration() {
    setTimeout(
      () => this.generateClient(),
      Math.max(
        1000,
        Random.rangeFloat(
          this.clientAutoGenerateCooldown.min,
          this.clientAutoGenerateCooldown.max
        ) * 1000
      )
    )
  }

  // Generate a client automatically
  generateClient() {
    // If simulation is not running or auto generation is off, skip client creation
    if (this.autoGeneration && Simulation.isRunning) {
      // Get the vertices sorted by position
      const sortedX = Vertex.sortedCoords.get('x')
      const sortedY = Vertex.sortedCoords.get('y')

      // Get a random coordinate
      const randomCoords = () => ({
        x:
          sortedX.length > 0
            ? Random.rangeFloat(sortedX[0].x, sortedX[sortedX.length - 1].x)
            : Random.rangeFloat(-100, 100),
        y:
          sortedY.length > 0
            ? Random.rangeFloat(sortedY[0].y, sortedY[sortedY.length - 1].y)
            : Random.rangeFloat(-100, 100),
      })

      // Gen the client
      const client = new Client(
        (Client.highestId ?? 0) + 1,
        randomCoords(),
        randomCoords()
      )

      // Play sound
      client.playSound(client.sound)
    }

    // Start timeout for next generation
    this.scheduleClientGeneration()
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
