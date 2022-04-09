import Drawable from './Drawable'
import Map from '../Map'
import theme from '../../configuration/theme'
import IO from '../IO'
import RouteHighlighter from './RouteHighlighter'
import Camera from '../Camera'
import SortProperties from '../SortProperties'
import { findFittest, unorderedFindFittest } from '../../helpers/search'
import ClientCreator from './Creators/ClientCreator'

const {
  clientHoverGrow,
  highlightColor,
  selectedClientRadius,
  clientDestinationRadius,
} = theme

const alterDestinationKey = 'client-alter-destination'

// Define um cliente
export default class Client extends Drawable {
  // Guarda os clientes ordenados pelas coordenada
  static sortedCoords = new SortProperties({
    x: (c1, c2) => c1.x < c2.x,
    y: (c1, c2) => c1.y < c2.y,
  })

  // Armazena referencia d equal cliente esta selecionado
  static #selected = null

  // Listeners
  static listeners = { select: [], routeselect: [] }

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
    if (this.#selectedRouteCompatibility != Map.version) {
      this.selectedRoute = null
    }

    return this.#selectedRoute
  }

  set selectedRoute(value) {
    this.#selectedRoute = value
    this.#selectedRouteCompatibility = Map.version
    Client.raiseEvent('routeselect', { client: this, route: value })
  }

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
          console.log(Client.sortedCoords)

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
      max: clientHoverGrow,
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
  }

  draw(drawer) {
    // Antes de mais nada, desataca sua rota
    if (this.isSelected && this.selectedRoute != null) {
      RouteHighlighter.highlightRoute(this.selectedRoute, drawer)
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

  alterDestination(target) {
    IO.removeCancelCallback(alterDestinationKey)

    Client.changeDestination.set(false)

    this.destination = target
    this.selectedRoute = null
  }

  static nameProperties(location, destination) {
    return { ...location, destination }
  }
}
