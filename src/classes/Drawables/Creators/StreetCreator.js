import appConfig from '../../../configuration/appConfig'
import theme from '../../../configuration/theme'
import { findFittest, unorderedFindFittest } from '../../../helpers/search'
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
const deselectEdgeToken = 'deselect-edge'

// Permite criar novos vertices e arestas
export default class StreetCreator extends Creator {
  // A velocidade das ruas a serem criadas
  streetSpeed = null

  // De qual vertice a proxima rua a ser desenhada deve sair
  #sourceVertex = null

  get sourceVertex() {
    return this.#sourceVertex
  }

  set sourceVertex(value) {
    this.#sourceVertex = value

    if (value != null) {
      this.selectedEdge = null
      IO.removeCancelCallback(deselectEdgeToken)
    } else IO.removeCancelCallback(streetSourceCancelToken)
  }

  // Qual vertice esta sob o mouse
  hoveredVertex = null

  // Qual aresta esta sob o mouse
  hoveredEdge = null

  // Se havia uma edge hovered na ultima frame
  wasEdgeHovered = false

  // Se ha uma aresta selecionada
  get selectedEdge() {
    return this.#selectedEdge
  }

  set selectedEdge(value) {
    this.#selectedEdge = value
    StreetCreator.raiseEvent('selectstreet', value)

    if (value != null) {
      this.sourceVertex = null
      IO.removeCancelCallback(deselectEdgeToken)
    }
  }

  #selectedEdge = null

  // Listeners
  static listeners = {
    createstreet: [],
    selectstreet: [],
  }

  // Reflete o estado do botao de apagar ruas
  eraseStreets = { isActive: false, set: null }

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

      // Se ja possui um set
      if (this.eraseStreets.set != null) this.eraseStreets.set(value)
      // Do contrario, inicializa o set
      else {
        IO.addCancelCallback(eraseStreetsToken, () =>
          this.eraseStreets.set(false)
        )

        this.eraseStreets.isActive = value
      }

      this.eraseStreets.set = (newValue) => {
        if (newValue == false && this.eraseStreets.isActive) {
          IO.removeCancelCallback(eraseStreetsToken)
        } else if (newValue == true && this.eraseStreets.isActive == false) {
          IO.addCancelCallback(eraseStreetsToken, () =>
            this.eraseStreets.set(false)
          )
        }

        this.eraseStreets.isActive = newValue
        setValue(newValue)
      }
    })
  }

  onDraw(drawer) {
    // Detecta se o mouse esta sobre um vertice
    this.detectVertexHover()

    // Detecta se o mouse esta sobre uma aresta
    this.detectEdgeHover(drawer)

    // Atualiza o cursor
    if (
      this.wasEdgeHovered &&
      (this.hoveredEdge == null || this.hoveredVertex != null)
    ) {
      this.wasEdgeHovered = false
      Map.removeCursor('pointer')
    } else if (
      !this.wasEdgeHovered &&
      this.hoveredEdge != null &&
      this.hoveredVertex == null
    ) {
      this.wasEdgeHovered = true
      Map.setCursor('pointer')
    }

    // No modo apagar, nao desenha o normal
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

      // Desenha a aresta hovered tambem
      else if (this.hoveredEdge != null) {
        this.hoveredEdge.draw(drawer, eraseColor)
        this.arrowDrawable.drawForEdge(this.hoveredEdge, drawer)
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

      if (this.selectedEdge != null)
        this.highlightEdge(this.selectedEdge, drawer)
    }

    // Se nao, desenha um pontinho no cursor
    else {
      fillArc(IO.mouse.mapCoords, streetWidth / 2)

      // Tambem verifica se esta edge hovered
      if (this.selectedEdge != null)
        this.highlightEdge(this.selectedEdge, drawer)
      else if (this.hoveredEdge != null)
        this.highlightEdge(this.hoveredEdge, drawer)
    }

    // Se tiver um source
    if (this.sourceVertex == null) return

    // Desenha um pontinho nele
    fillArc(this.sourceVertex, streetWidth / 2)

    // Desenha um caminho do source ate o mouse
    strokePath(this.sourceVertex, destination)

    // Desenha as setas
    this.drawArrows(this.sourceVertex, destination, drawer)
  }

  highlightEdge(edge, drawer, color) {
    const { strokePath, fillArc } = drawer.drawWith({
      style: color ?? highlightColor,
      lineWidth: streetWidth * 1.5,
    })

    fillArc(edge.source, streetWidth * 0.75)
    fillArc(edge.destination, streetWidth * 0.75)

    strokePath(edge.source, edge.destination)

    edge.destination.draw(drawer)
    edge.source.draw(drawer)
    edge.draw(drawer)
    this.arrowDrawable.drawForEdge(edge, drawer)
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
      // Remove o cancel callback
      if (!cancelToken.cancelled)
        IO.removeCancelCallback(streetSourceCancelToken)

      // Execute ate ser cancelado
      while (!cancelToken.cancelled) {
        // Retira o source
        this.sourceVertex = null

        const { x, y } = IO.mouse.mapCoords

        // Ajusta a posicao do vertice
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

      for (const edge of vertex.edges) {
        // Recalcula os vetores ordenados das arestas
        Edge.sortedCoords.remove(edge)

        edge.setBoundVertices()

        Edge.sortedCoords.register(edge)
      }

      // Atualiza a versao do mapa
      Map.advanceVersion()
    }, 200)
  }

  static moveVertexCancelToken = { cancelled: false }

  eraseEdge(edge, advanceMapVersion = true) {
    if (edge == this.selectedEdge) this.selectedEdge = null

    for (const car of Object.values(edge.cars)) car.destroy()

    edge.destroy()

    if (advanceMapVersion) Map.advanceVersion()
  }

  eraseVertex(vertex) {
    for (const edge of vertex.edges) this.eraseEdge(edge, false)

    vertex.destroy()

    // Atualiza o mapa
    Map.advanceVersion()
  }

  handleClick(position) {
    // No modo apagar
    if (this.eraseStreets.isActive) {
      // Se clicou num vertice
      if (this.hoveredVertex != null) {
        this.eraseVertex(this.hoveredVertex)

        this.hoveredVertex = null
      }

      // Se clicou numa aresta
      else if (this.hoveredEdge != null) {
        this.eraseEdge(this.hoveredEdge)

        this.hoveredEdge = null
      }

      return
    }

    // Verifica se clicou numa aresta (mas nao um vertice)
    if (this.hoveredEdge != null && this.hoveredVertex == null) {
      this.selectedEdge = this.hoveredEdge

      // Adiciona um cancel callback
      IO.addCancelCallback(deselectEdgeToken, () => (this.selectedEdge = null))

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

    const xSortedVertices = Vertex.sortedCoords.get('x')

    // Entre os vertices, encontra os mais proximos
    const closestByXInterval = findFittest(
      xSortedVertices,
      (vertex) => vertex.x - mouse.x,
      maxDistance
    )

    // Encontra um vertice proximo o suficiente em y tambem
    this.hoveredVertex = unorderedFindFittest(
      // Mapeia os indices em vertices
      xSortedVertices,
      (vertex) => vertex.y - mouse.y,
      maxDistance,
      closestByXInterval
    )
  }

  detectEdgeHover(drawer) {
    // Pega as coordenadas do mouse
    const { mapCoords: mouse } = IO.mouse

    // Distancia maxima ate o cursor
    const maxDistance = streetWidth / 2

    // Pega as 4 listas ordenadas
    const leftSorted = Edge.sortedCoords.get('leftVertexX')
    const rightSorted = Edge.sortedCoords.get('rightVertexX')
    const upperSorted = Edge.sortedCoords.get('upperVertexY')
    const lowerSorted = Edge.sortedCoords.get('lowerVertexY')

    // Filtra as listas de x

    // Encontra as arestas cujo vertice da esquerda esta para a esquerda do cursor
    const leftBounded = findFittest(
      leftSorted,
      (edge) => Math.max(0, edge.leftVertex.x - mouse.x - maxDistance),
      maxDistance
    )

    // Encontra as arestas cujo vertice da direita esta para a direita do cursor
    const rightBounded = findFittest(
      rightSorted,
      (edge) => Math.min(0, edge.rightVertex.x - mouse.x + maxDistance),
      maxDistance
    )

    // Encontra as arestas cujo vertice de cima esta para cima do cursor
    // Lembrando q y cresce para baixo
    const upperBounded = findFittest(
      upperSorted,
      (edge) => Math.max(0, edge.upperVertex.y - mouse.y - maxDistance),
      maxDistance
    )

    // Encontra as arestas cujo vertice de baixo esta para baixo do cursor
    // Lembrando q y cresce para baixo
    const lowerBounded = findFittest(
      lowerSorted,
      (edge) => Math.min(0, edge.lowerVertex.y - mouse.y + maxDistance),
      maxDistance
    )

    // console.log(`
    // left: [${leftBounded}]
    // right: [${rightBounded}]
    // upper: [${upperBounded}]
    // lower: [${lowerBounded}]
    // `)

    const boundArray = [leftBounded, rightBounded, upperBounded, lowerBounded]
    const sortedArrays = [leftSorted, rightSorted, upperSorted, lowerSorted]

    // Encontra qual das 4 listas de arestas tem menos arestas (i.e. o menor intervalo de indices)
    const shortestIntervalIndex = unorderedFindFittest(
      boundArray,
      // Se for um vetor vazio, ele deve ter prioridade
      (interval) => (interval[1] != undefined ? interval[1] - interval[0] : 0),
      null,
      null,
      // Esse parametro solicite que retorne o indice
      true
    )

    // for (
    //   let i = boundArray[shortestIntervalIndex][0];
    //   i < boundArray[shortestIntervalIndex][1];
    //   i++
    // ) {
    //   this.highlightEdge(sortedArrays[shortestIntervalIndex][i], drawer, 'red')
    // }

    // console.log(['left', 'right', 'upper', 'lower'][shortestIntervalIndex])

    // Buscando dentro deste intervalo somente, encontramos qual aresta esta mais proxima do mouse
    this.hoveredEdge = unorderedFindFittest(
      sortedArrays[shortestIntervalIndex],
      (edge) => edge.getProjectionDistanceSquared(mouse),
      Math.pow(maxDistance, 2),
      boundArray[shortestIntervalIndex]
    )
  }

  onCancel() {
    if (this.eraseStreets.set != null) this.eraseStreets.set(false)

    this.selectedEdge = null
    this.sourceVertex = null
    this.streetSpeed = null

    IO.removeCancelCallback(streetSourceCancelToken)
    IO.removeCancelCallback(deselectEdgeToken)
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
