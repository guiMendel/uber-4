import Drawable from './Drawable'
import Map from '../Map'
import theme from '../../configuration/theme'
import Client from './Client'
import IO from '../IO'
import {
  angleBetween,
  displacePoint,
  getDistance,
} from '../../helpers/vectorDistance'
import { cos, sin } from '../../helpers/trygonometry'
import SortProperties from '../SortProperties'

const { highlightColor, clientHoverGrow } = theme

const cancelCarSelect = 'car-select-cancel'

// Define os carros
export default class Car extends Drawable {
  // Guarda os carros ordenados pelas coordenada
  static sortedCoords = new SortProperties({
    x: (c1, c2) => c1.x < c2.x,
    y: (c1, c2) => c1.y < c2.y,
  })

  // Armazena referencia de qual carro esta selecionado
  static #selected = null

  // Listeners
  static listeners = { select: [] }

  static get selected() {
    return this.#selected
  }

  static set selected(value) {
    // Adiciona um cancel callback se nao tinha um carro selecionado antes
    if (value != null && this.#selected == null) {
      IO.addCancelCallback(cancelCarSelect, () => (this.selected = null))
    }

    // Se estiver desselecionando, remove
    else if (value == null) {
      IO.removeCancelCallback(cancelCarSelect)
    }

    this.#selected = value
    this.raiseEvent('select', value)
  }

  get isHovered() {
    return this.distanceFromMouse < this.carImage.height + 3
  }

  get isSelected() {
    return this == Car.selected
  }

  // Qual a rota atual desse carro
  #assignedRoute = null

  get assignedRoute() {
    return this.#assignedRoute
  }

  set assignedRoute(value) {
    const oldRoute = this.#assignedRoute

    this.#assignedRoute = value

    // Se tivesse uma rota antes, tira ela do cliente que a tinha
    if (oldRoute != null) {
      oldRoute.stepper.client.setRouteUnchained(null)
    }
  }

  // Caso o carro estava no estado hovered na ultima iteracao
  wasHovered = false

  static setup() {
    // Quando nao estiver mais no modo cliente, desseleciona
    Map.addEventListener('activateinteractionclass', ({ value, oldValue }) => {
      if (value != oldValue && oldValue == Client) this.selected = null
    })
  }

  constructor(id, ...rawProperties) {
    const properties = Car.nameProperties(...rawProperties)

    // Invoca construtor pai
    super(id, properties)

    const { edge } = properties

    Car.sortedCoords.register(this)
    this.onDestroy.push(() => Car.sortedCoords.remove(this))

    // Registra na aresta
    edge.cars[this.id] = this

    this.onDestroy.push(() => this.edge.cars && delete this.edge.cars[this.id])

    // Pega a imagem do carro
    this.carImage = Map.instance.carImage
    this.redCarImage = Map.instance.redCarImage

    // O atual scale da imagem
    this.scale = 1

    // Em que parte dda aresta esta
    this.edgeProgress = getDistance(this, edge.source) / edge.mapDistance

    // Se o mouse estiver proximo E um cliente estiver selecionado, aumenta o tamanho
    this.animate({
      property: 'scale',
      min: 1,
      max: clientHoverGrow,
      condition: () => Client.selected != null && this.isHovered,
    })

    const handleLeftClick = () => {
      // Se estiver em hover E um cliente estiver selecionado, seleciona
      if (Client.selected != null && this.isHovered) {
        Car.selected = this
      }
    }

    // Observa cliques
    IO.addEventListener('leftclick', handleLeftClick)

    this.onDestroy.push(() =>
      IO.removeEventListener('leftclick', handleLeftClick)
    )

    // Se tiver uma rota, avisa o cliente quando for destruido
    this.onDestroy.push(() => {
      if (this.assignedRoute != null) {
        this.#assignedRoute.stepper.client.setRouteUnchained(null)
      }
    })
  }

  draw(drawer) {
    const { drawImage, strokeArc } = drawer.drawWith({
      style: highlightColor,
      lineWidth: 5,
    })

    // Atualiza o cursor
    if (this.wasHovered && (!this.isHovered || Client.selected == null)) {
      this.wasHovered = false
      Map.removeCursor('pointer')
    } else if (!this.wasHovered && this.isHovered && Client.selected != null) {
      this.wasHovered = true
      Map.setCursor('pointer')
    }

    // Desenha um highlight, se estiver selecionado
    if (this.isSelected) strokeArc(this, this.carImage.height / 2 + 5)

    drawImage(
      this.assignedRoute == null ? this.carImage : this.redCarImage,
      this,
      this.edge.angle - 90,
      this.scale
    )
  }

  simulationStep(deltaTime) {
    // Fica paradao se nao tem rota
    if (this.assignedRoute == null) return

    // Pega o cliente da rota
    const { client } = this.assignedRoute.stepper

    // Se a fase da rota do cliente for 0 ou 1, ainda nao ocorreu o rendez vous, portanto, usa a rota pai
    const movementRoute =
      client.routePhase > 1
        ? this.assignedRoute
        : this.assignedRoute.stepper.parentNode

    // Pega a aresta da rota
    const nodeArray = [movementRoute]

    const getFirstNode = () => nodeArray[nodeArray.length - 1]

    // Popula o vetor de nodes
    while (getFirstNode().parent != null) {
      nodeArray.push(getFirstNode().parent)
    }

    if (getFirstNode().edge.id != this.edge.id) {
      // Garante que seja a mesma que o carro esta (se nao estiver talvez seja pq ele acabou de comecar a 2a rota, mas por alguma razao ainda nao atualizaou a aresta)
      console.warn('A aresta da rota nao coincide com a aresta do carro')

      // Atualiza a rota do carro
      this.edge = getFirstNode().edge
      Object.assign(this, this.edge.source)
    }

    // Se esta no ultimo node e em sua projecao, nao precisa se deslocar
    if (
      nodeArray.length == 1 &&
      this.x == getFirstNode().projectionCoords.x &&
      this.y == getFirstNode().projectionCoords.y
    )
      return

    // Descobre deslocamento do carro
    let carMovement = this.edge.mapSpeed * deltaTime

    // Descobre o destino nesta aresta
    // Se esse for o ultimo node, vai ate o ponto de projecao
    let nodeDestination =
      nodeArray.length == 1
        ? getFirstNode().projectionCoords
        : this.edge.destination

    // Desloca o carro pelas arestas ate seu movimento acabar
    while (carMovement > 0) {
      // Verifica se ja esta proximo o suficiente do fim da aresta
      const distanceToEdgeDestination = getDistance(this, nodeDestination)

      if (distanceToEdgeDestination < carMovement) {
        // Se este eh o ultimo node da rota, finaliza ela
        if (nodeArray.length == 1) {
          // Se posiciona la
          Object.assign(this, getFirstNode().projectionCoords)
          return
        }

        // Se sim, passa pro proximo node
        nodeArray.pop()

        // Deleta o ultrapassado
        getFirstNode().parent = null

        // Atualiza a aresta
        this.edge = getFirstNode().edge

        // Subtrai do movimento
        carMovement -= distanceToEdgeDestination

        // Atualiza posicao
        Object.assign(this, this.edge.source)

        nodeDestination =
          nodeArray.length == 1
            ? getFirstNode().projectionCoords
            : this.edge.destination

        continue
      }

      // Se nao, apenas se move essa distancia
      const directionAngle = angleBetween(this, nodeDestination)

      Object.assign(this, displacePoint(this, carMovement, directionAngle))

      break
    }
  }

  // Se reposiciona na aresta
  fixPosition() {
    Car.sortedCoords.remove(this)

    const distanceToSource = this.edgeProgress * this.edge.mapDistance

    this.x = this.edge.source.x + distanceToSource * cos(this.edge.angle)
    this.y = this.edge.source.y - distanceToSource * sin(this.edge.angle)

    Car.sortedCoords.register(this)
  }

  // Nao avisa o antigo cliente
  setRouteUnchained(newRoute) {
    this.#assignedRoute = newRoute
  }

  static nameProperties(edge, realX, realY) {
    // Dada a posicao inicial e aresta, descobrimos em que parte da rua o carro esta, e com isso qual a real posicao inicial dele
    const { x, y } = edge.getProjectionCoordinates({ x: realX, y: realY })

    // console.log(`Original: ${realX}, ${realY}\nNew: ${x}, ${y}\n\n`)

    return { x, y, edge }
  }
}
