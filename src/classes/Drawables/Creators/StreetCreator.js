import appConfig from '../../../configuration/appConfig'
import theme from '../../../configuration/theme'
import { findSmallestValues } from '../../../helpers/search'
import { angleBetween, getDistance } from '../../../helpers/vectorDistance'
import IO from '../../IO'
import Map from '../../Map'
import ArrowIndicators from '../ArrowIndicators'
import Drawable from '../Drawable'
import Edge from '../Edge'
import Vertex from '../Vertex'
import Creator from './Creator'

const { streetColorSlowest, streetWidth, highlightColor, eraseColor } = theme

const { newStreetVertexSnapRange } = appConfig

const streetSourceCancelToken = 'create-street-source-cancel'

const eraseStreetsToken = 'erase-streets'

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

  // Reflete o estado do botao de apagar ruas
  eraseStreets = { isActive: false, set: null }

  onCancel() {
    IO.removeCancelCallback(eraseStreetsToken)

    this.eraseStreets.set(false)
  }

  constructor() {
    super()

    // Guarda uma referencia ao arrow drawable
    this.arrowDrawable = Drawable.drawableInstances[ArrowIndicators.name][0]

    // Cancela qualquer vertex move quando soltar o botao
    IO.addEventListener('leftup', () => {
      StreetCreator.moveVertexCancelToken.cancelled = true
    })

    // Ouve botao de apagar ruas
    IO.addButtonListener('delete-streets', ({ value, setValue }) => {
      // Inicia o modo apagar ruas
      IO.addCancelCallback(eraseStreetsToken, () =>
        this.eraseStreets.set(false)
      )

      this.eraseStreets.isActive = value
      this.eraseStreets.set = (newValue) => {
        this.eraseStreets.isActive = newValue
        setValue(newValue)
      }
    })
  }

  onDraw(drawer) {
    // Detecta se o mouse esta sobre um vertice
    this.detectVertexHover()

    // No modo apagar, nao desenha nada
    if (this.eraseStreets.isActive) {
      // Desenha o vertice hovered em vermelho
      if (this.hoveredVertex != null) {
        this.hoveredVertex.draw(drawer, eraseColor)

        // Desenha suas arestas
        for (const edge of this.hoveredVertex.edges) {
          edge.draw(drawer, eraseColor)
        }

        // Desenha as setas
        for (const edge of this.hoveredVertex.edges) {
          this.arrowDrawable.drawForEdge(edge, drawer)
        }
      }

      return
    }

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

  moveVertex(vertex, cancelToken) {
    // Espera 1s antes de comecar
    setTimeout(async () => {
      // Execute ate ser cancelado
      while (!cancelToken.cancelled) {
        // Retira o source
        this.sourceVertex = null

        // Ajusta a posicao do vertice
        const { x, y } = IO.mouse.mapCoords

        vertex.x = x
        vertex.y = y

        // Reposiciona os carros que dependem deste vertices
        for (const edge of vertex.edges) {
          for (const car of Object.values(edge.cars)) car.fixPosition()
        }

        // Espera o fim da frame
        await Map.endOfFrame()
      }

      // Recalcula os vetores ordenados do vertice
      Vertex.sortedCoords.remove(vertex)
      Vertex.sortedCoords.register(vertex)
    }, 200)
  }

  static moveVertexCancelToken = { cancelled: false }

  handleClick(position) {
    // No modo apagar
    if (this.eraseStreets.isActive) {
      if (this.hoveredVertex != null) {
        for (const edge of this.hoveredVertex.edges) {
          for (const car of Object.values(edge.cars)) car.destroy()

          edge.destroy()
        }
      }

      this.hoveredVertex.destroy()

      this.hoveredVertex = null

      return
    }

    // Se nao tinha um source
    if (this.sourceVertex == null) {
      // Aplica um cancel overide
      IO.addCancelCallback(streetSourceCancelToken, () => {
        // Somente remove o source
        this.sourceVertex = null
      })

      // Se clicar num vertice, troca para este vertice ser o novo source
      if (this.hoveredVertex != null) {
        this.sourceVertex = this.hoveredVertex

        // Inicia a rotina para mover o vertice
        StreetCreator.moveVertexCancelToken.cancelled = false
        this.moveVertex(this.hoveredVertex, StreetCreator.moveVertexCancelToken)

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
    // TODO: garantir q isso seja feito com binary search
    const closestByX = findSmallestValues(
      Vertex.sortedCoords.get('x'),
      (vertex) => Math.abs(vertex.x - mouse.x)
    )

    // Se a distancia x for muito, ja ignora
    if (Math.abs(closestByX[0].x - mouse.x) > maxDistance) {
      this.hoveredVertex = null
      return
    }

    // TODO: usar o find smallest values aqui tb, e depois pegar o vertice mais proximo dos resultados
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

    IO.removeCancelCallback(streetSourceCancelToken)
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
