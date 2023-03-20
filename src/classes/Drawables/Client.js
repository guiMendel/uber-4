import Drawable from './Drawable'
import Map from '../Map'
import Configuration from '../../configuration/Configuration'
import IO from '../IO'
import RouteHighlighter from './RouteHighlighter'
import Camera from '../Camera'
import SortProperties from '../SortProperties'
import { findFittest, unorderedFindFittest } from '../../helpers/search'
import ClientCreator from './Creators/ClientCreator'
import Configuration from '../../configuration/Configuration'
import {
  angleBetween,
  displacePoint,
  getDistance,
} from '../../helpers/vectorDistance'

const alterDestinationKey = 'client-alter-destination'

// Fases de uma rota
const walkToRendezVous = 0
const waitingCar = 1
const inCar = 2

// Define um cliente
export default class Client extends Drawable {
  // Guarda os clientes ordenados pelas coordenada
  static sortedCoords = new SortProperties({
    x: (c1, c2) => c1.x < c2.x,
    y: (c1, c2) => c1.y < c2.y,
  })

  // Armazena referencia d equal cliente esta selecionado
  static #selected = null

  static highestId = undefined

  // Listeners
  static listeners = { select: [], routeselect: [], delete: [], new: [] }

  static get selected() {
    return this.#selected
  }

  static set selected(value) {
    this.#selected = value
    this.raiseEvent('select', value)
  }

  // Qual cliente esta sob hover
  static hovered = null

  // Reflete o estado do botao de alterar destino do cliente
  static changeDestination = { isActive: false, set: null }

  get isHovered() {
    return this == Client.hovered
  }

  get isSelected() {
    return this == Client.selected
  }

  // A rota selecionada para este cliente
  #selectedRoute = null

  // Para qual versao do mapa esta rota eh valida
  #selectedRouteCompatibility = null

  get selectedRoute() {
    // Se a rota nao eh mais compativel, descarta ela
    if (
      this.#selectedRoute != null &&
      this.#selectedRouteCompatibility != Map.version
    ) {
      this.selectedRoute = null
    }

    return this.#selectedRoute
  }

  set selectedRoute(value) {
    // Descarta informacao de fase
    this.routePhase = null

    const oldRoute = this.#selectedRoute

    this.#selectedRoute = value
    this.#selectedRouteCompatibility = Map.version

    Client.raiseEvent('routeselect', { client: this, route: value })

    // Se tinha uma rota antes
    if (oldRoute != null && oldRoute != 'walk') {
      // Avisa o antigo carro
      oldRoute.stepper.car.setRouteUnchained(null)
    }

    // Marca o carro como ocupado
    if (this.#selectedRoute != null && this.#selectedRoute != 'walk')
      this.#selectedRoute.stepper.car.assignedRoute = this.#selectedRoute
  }

  // O estagio atual da rota
  routePhase = null

  static deselect() {
    this.selected = null

    this.changeDestination = { isActive: false, set: null }
  }

  static select(client) {
    this.selected = client
    Map.activeInteractionClass = Client
  }

  static setup() {
    // Deseleciona cliente no cancel
    IO.addEventListener('cancel', () => {
      if (Map.activeInteractionClass == Client)
        Map.activeInteractionClass = null
      this.deselect()
    })

    // Mantem o cursor atualizado
    Map.addEventListener('activateinteractionclass', ({ value, oldValue }) => {
      if (value != oldValue && oldValue == Client) this.deselect()
    })

    // Ouve os botoes de centralizar camera
    IO.addButtonListener('center-client', () => Camera.center(this.selected))
    IO.addButtonListener('center-destination', () =>
      Camera.center(this.selected.destination)
    )

    // Ouve botao de alterar destino
    IO.addButtonListener('change-destination', ({ value, setValue }) => {
      // Inicia o modo alterar destino
      IO.addCancelCallback(alterDestinationKey, () =>
        this.changeDestination.set(false)
      )

      this.changeDestination.isActive = value
      this.changeDestination.set = (newValue) => {
        this.changeDestination.isActive = newValue
        setValue(newValue)
      }
    })

    // Detecta client hover
    IO.addEventListener('mousemove', ({ mapPosition: { x, y } }) => {
      // Distancia maxima para ocorrer o hover
      const maxDistance = Map.instance.clientImage[0].width + 3

      const xSortedClients = Client.sortedCoords.get('x')

      // Entre os clientes, encontra os mais proximos em x
      const closestByXInterval = findFittest(
        xSortedClients,
        (client) => client.x - x,
        maxDistance
      )

      // Encontra um cliente proximo o suficiente em y tambem
      this.hovered = unorderedFindFittest(
        // Mapeia os indices em clientes
        xSortedClients,
        (client) => client.y - y,
        maxDistance,
        closestByXInterval
      )

      // Atualiza o cursor
      if (this.wasHovered && this.hovered == null) {
        this.wasHovered = false
        Map.removeCursor('pointer')
      } else if (!this.wasHovered && this.hovered != null) {
        this.wasHovered = true
        Map.setCursor('pointer')
      }
    })

    IO.addEventListener('leftclick', () => {
      // Se tem um cliente em hover, seleciona ele
      if (this.hovered != null) {
        // Verifica se o modo de apagar cliente esta ativo
        if (ClientCreator.getInstance().eraseClients.isActive) {
          // Destroi esse cliente
          this.hovered.destroy()
          this.hovered = null

          return
        }

        this.select(this.hovered)
        if (this.changeDestination.set) this.changeDestination.set(false)
        return
      }

      if (!this.changeDestination.isActive) return

      Client.selected.alterDestination(IO.mouse.mapCoords)
    })
  }

  // Caso o cliente estava no estado hovered na ultima iteracao
  wasHovered = false

  constructor(id, location, destination, image, rotation) {
    // Invoca construtor pai
    super(id, Client.nameProperties(location, destination))

    // Registra no sorted coords
    Client.sortedCoords.register(this)
    this.onDestroy.push(() => Client.sortedCoords.remove(this))

    // Define uma rotacao aleatoria
    this.rotation = rotation ?? Math.random() * 360

    // Pega uma das 3 imagens
    this.image =
      image ?? Map.instance.clientImage[Math.floor(Math.random() * 3)]

    // O atual scale da imagem
    this.scale = 1

    // Se o mouse estiver proximo, aumenta o tamanho
    this.animate({
      property: 'scale',
      min: 1,
      max: Configuration.getInstance().theme.clientHoverGrow,
      condition: () => this.isHovered,
    })

    // A atual transparencia do highlight
    this.highlightOpacity = 0
    this.animate({
      property: 'highlightOpacity',
      min: 0,
      max: 1,
      condition: () => this.isSelected,
    })

    // Se tiver uma rota quando for desturido, avisa o carro
    this.onDestroy.push(() => {
      if (this.selectedRoute != null && this.selectedRoute != 'walk') {
        this.selectedRoute.stepper.car.setRouteUnchained(null)
      }
    })

    // Levanta quando for destruido
    this.onDestroy.push(() => Client.raiseEvent('delete', this))

    Client.raiseEvent('new', this)

    if (Client.highestId == undefined || Client.highestId < this.id)
      Client.highestId = this.id
  }

  draw(drawer) {
    const { highlightColor, selectedClientRadius, clientDestinationRadius } =
      Configuration.getInstance().theme

    // Antes de mais nada, desataca sua rota
    if (this.isSelected && this.selectedRoute != null) {
      if (this.selectedRoute != 'walk')
        RouteHighlighter.highlightRoute(this.selectedRoute, drawer)
      else {
        RouteHighlighter.drawClientWalkRoute(this, drawer)
      }
    }

    // Pega a transparencia do highlight em hex
    let opacityHex = Math.floor(this.highlightOpacity * 255).toString(16)
    if (opacityHex.length == 1) opacityHex = '0' + opacityHex

    const { drawImage, strokeArc } = drawer.drawWith({
      style: highlightColor + opacityHex,
      lineWidth: 5,
    })

    // Desenha um highlight, que sera transparente se n estiver selecionado
    strokeArc(this, selectedClientRadius)

    drawImage(this.image, this, this.rotation - 90, this.scale)

    if (this.isSelected) {
      // Desenha o preview do novo destino, se ativo
      if (Client.changeDestination.isActive) {
        const { fillArc } = drawer.drawWith({
          opacity: 0.5,
          style: highlightColor,
        })

        // Desenha o destino
        fillArc(IO.mouse.mapCoords, clientDestinationRadius)
      } else {
        const { fillArc } = drawer.drawWith({
          style: highlightColor,
        })

        // Desenha seu destino se selecionado
        fillArc(this.destination, clientDestinationRadius)
      }
    }
  }

  simulationStep(deltaTime) {
    if (this.selectedRoute == null) return

    // Helper para andar ate a posicao
    const walkTo = (position, finishCallback) => {
      const { clientWalkSpeed, pixelsPerKilometer } =
        Configuration.getInstance().general

      const walkDistance = clientWalkSpeed * deltaTime * pixelsPerKilometer

      if (getDistance(this, position) <= walkDistance) {
        // Se desloca ate o destino
        Object.assign(this, position)

        finishCallback()

        return
      }

      // Simplesmente avanca a posicao
      const walkAngle = angleBetween(this, position)

      this.rotation = walkAngle

      Object.assign(this, displacePoint(this, walkDistance, walkAngle))
    }

    // Caso a rota seja andar
    if (this.selectedRoute == 'walk') {
      // Se move ate la
      walkTo(this.destination, () => this.reachDestination())

      return
    }

    // Garante que isso esteja inicializado
    this.routePhase ??= walkToRendezVous

    const phaseHandler = {
      [walkToRendezVous]: () => {
        // Encontra o ponto de rdv
        const rendezVous =
          this.selectedRoute.stepper.parentNode.projectionCoords

        // Se move ate la
        walkTo(rendezVous, () => this.routePhase++)
      },

      [waitingCar]: () => {
        const { clientWalkSpeed, pixelsPerKilometer } =
          Configuration.getInstance().general

        // Verifica se o carro esta a alcance
        const walkDistance = clientWalkSpeed * deltaTime * pixelsPerKilometer

        // Se estiver
        if (getDistance(this.selectedRoute.stepper.car, this) <= walkDistance) {
          // Avanca a fase
          this.routePhase++

          // Ajusta o source na nova rota para ser o carro em vez do rendez vous
          // Assim o desenho da rota fica correto
          this.selectedRoute.stepper.source = this.selectedRoute.stepper.car
        }
      },

      [inCar]: () => {
        const { car } = this.selectedRoute.stepper

        // Ve a velocidade do carro
        const driveDisplacement = car.edge.mapSpeed * deltaTime

        // Verifica se ja esta proximo o suficiente do ponto de entrega
        if (
          car.edge == this.selectedRoute.edge &&
          getDistance(car, this.selectedRoute.projectionCoords) <=
            driveDisplacement
        ) {
          // Atualiza coordenadas
          Object.assign(this, this.selectedRoute.projectionCoords)

          // Finaliza a rota e anda o resto
          this.routePhase = null
          this.selectedRoute = 'walk'

          return
        }

        // Atualiza suas coordenadas para a do carro
        this.x = car.x
        this.y = car.y
      },
    }

    phaseHandler[this.routePhase]()
  }

  // Informa que o cliente chegou no destino
  reachDestination() {
    this.destroy()
  }

  alterDestination(target) {
    IO.removeCancelCallback(alterDestinationKey)

    Client.changeDestination.set(false)

    this.destination = target
    this.selectedRoute = null
  }

  // Nao avisa o antigo carro que mudou de rota
  setRouteUnchained(newRoute) {
    this.#selectedRoute = newRoute
    this.#selectedRouteCompatibility = Map.version

    Client.raiseEvent('routeselect', { client: this, route: newRoute })

    // Marca o carro como ocupado
    if (newRoute != null && newRoute != 'walk')
      this.#selectedRoute.stepper.car.assignedRoute = this.#selectedRoute
  }

  static nameProperties(location, destination) {
    return { ...location, destination }
  }
}
