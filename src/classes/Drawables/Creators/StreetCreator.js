import appConfig from '../../../configuration/appConfig'
import theme from '../../../configuration/theme'
import { findSmallestValues } from '../../../helpers/search'
import { angleBetween, getDistance } from '../../../helpers/vectorDistance'
import IO from '../../IO'
import ArrowIndicators from '../ArrowIndicators'
import Drawable from '../Drawable'
import Edge from '../Edge'
import Vertex from '../Vertex'
import Creator from './Creator'

const { streetColorSlowest, streetWidth, highlightColor } = theme

const { newStreetVertexSnapRange } = appConfig

// Permite criar novos vertices e arestas
export default class StreetCreator extends Creator {
  // A velocidade das ruas a serem criadas
  streetSpeed = null

  // De qual vertice a proxima rua a ser desenhada deve sair
  sourceVertex = null

  // Qual vertice esta sob o mouse
  hoveredVertex = null

  // Listeners
  static listeners = {
    createstreet: [],
  }

  constructor() {
    super()

    // Guarda uma referencia ao arrow drawable
    this.arrowDrawable = Drawable.drawableInstances[ArrowIndicators.name][0]
  }

  onDraw(drawer) {
    // Detecta se o mouse esta sobre um vertice
    this.detectVertexHover()

    const { fillArc, strokePath } = drawer.drawWith({
      style: streetColorSlowest,
      opacity: 0.5,
      lineWidth: streetWidth,
    })

    const { strokeArc } = drawer.drawWith({
      style: highlightColor,
      lineWidth: streetWidth / 4,
    })

    let destination = IO.mouse.mapCoords

    // Se tiver um vertice em hover
    if (this.hoveredVertex != null) {
      // Destaca o vertice
      strokeArc(this.hoveredVertex, (5 * streetWidth) / 8)

      // Usa o vertice como destination
      destination = this.hoveredVertex
    }

    // Se nao, desenha um pontinho no cursor
    else fillArc(IO.mouse.mapCoords, streetWidth / 2)

    // Se tiver um source
    if (this.sourceVertex == null) return

    // Desenha um pontinho nele
    fillArc(this.sourceVertex, streetWidth / 2)

    // Desenha um caminho do source ate o mouse
    strokePath(this.sourceVertex, destination)

    // Desenha as setas
    this.drawArrows(this.sourceVertex, destination, drawer)
  }

  // Utiliza o arro indicator para desenhar flechas de source ate destination
  drawArrows(source, destination, drawer) {
    // Precisamos simular uma edge
    const simulatedEdge = {
      source,
      destination,

      // Pega o mapDistance
      mapDistance: getDistance(source, destination),

      // Pega o angle
      angle: angleBetween(source, destination),
    }

    // Desenha as flechas
    this.arrowDrawable.drawForEdge(simulatedEdge, drawer, { opacity: 0.5 })
  }

  handleClick(position) {
    // Se nao tinha um source
    if (this.sourceVertex == null) {
      // Aplica um cancel overide
      IO.overrideCancelCallback = () => {
        // Somente remove o source
        this.sourceVertex = null
      }

      // Se clicar num vertice, troca para este vertice ser o novo source
      if (this.hoveredVertex != null) {
        this.sourceVertex = this.hoveredVertex
        return
      }

      // Se nao, criar um source virtual
      this.sourceVertex = { ...position.map, isVirtual: true }

      return
    }

    // Se ja tinha um source
    let destination

    // Verifica se esta em hover de um outro vertice
    if (this.hoveredVertex != null) {
      // Usa este vertice como destination
      destination = this.hoveredVertex
    }

    // Se nao, cria um novo vertice
    else {
      destination = new Vertex(undefined, position.map.x, position.map.y, true)
    }

    // Se o source eh virutal, cria ele tb
    if (this.sourceVertex.isVirtual)
      this.sourceVertex = new Vertex(
        undefined,
        this.sourceVertex.x,
        this.sourceVertex.y,
        true
      )

    // Cria a rua entre os vertices
    const street = new Edge(undefined, this.sourceVertex, destination, {
      mapSpeed: this.streetSpeed,
    })

    // Raise
    StreetCreator.#raiseEvent('createstreet', street)

    // Avanca o source para o destination
    this.sourceVertex = destination
  }

  detectVertexHover() {
    // Pega as coordenadas do mouse
    const { mapCoords: mouse } = IO.mouse

    // Distancia maxima ate o cursor
    const maxDistance = streetWidth / 2 + newStreetVertexSnapRange

    // Entre os vertices, encontra os mais proximos
    const closestByX = findSmallestValues(Vertex.verticesSortedBy.x, (vertex) =>
      Math.abs(vertex.x - mouse.x)
    )

    // Se a distancia x for muito, ja ignora
    if (Math.abs(closestByX[0].x - mouse.x) > maxDistance) {
      this.hoveredVertex = null
      return
    }

    // Encontra um vertice proximo o suficiente
    for (const vertex of closestByX) {
      if (getDistance(vertex, mouse) <= maxDistance) {
        this.hoveredVertex = vertex
        return
      }
    }

    this.hoveredVertex = null
  }

  onCancel() {
    this.sourceVertex = null
    this.streetSpeed = null

    IO.overrideCancelCallback = null
  }

  // Permite que o componente de configuracoes configure essa velocidade
  static setStreetSpeed(value) {
    this.getInstance().streetSpeed = value
  }

  // Permite observar eventos
  static addEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `A classe IO nao fornece um eventListener do tipo "${type}"`
      )

    this.listeners[type].push(callback)
  }

  // Permite observar eventos
  static removeEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `A classe IO nao fornece um eventListener do tipo "${type}"`
      )

    const index = this.listeners[type].indexOf(callback)

    if (index == -1) return

    this.listeners[type].splice(index, 1)
  }

  // Permite levantar eventos
  static #raiseEvent(type, payload) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `Tentativa em IO de levantar evento de tipo inexistente "${type}"`
      )

    for (const listener of this.listeners[type]) listener(payload)
  }
}
