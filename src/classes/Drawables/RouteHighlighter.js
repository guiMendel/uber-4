import theme from '../../configuration/theme'
import IO from '../IO'
import ArrowIndicators from './ArrowIndicators'
import Drawable from './Drawable'

const {
  selectedRouteHighlight,
  selectedRouteHighlightBeforeRdv,
  streetWidth,
  clientWalkPathLineGap,
  clientWalkPathLineSize,
  clientWalkPathWidth,
} = theme

// Este singleton permite destacar as arestas que compoem uma rota
export default class RouteHighlighter extends Drawable {
  static #instance

  // De qual node retirar a rota para destaque
  highlightedNode = null

  constructor() {
    if (RouteHighlighter.#instance != undefined)
      return RouteHighlighter.#instance

    super(1, {})

    RouteHighlighter.#instance = this

    // Guarda uma referencia ao arrow drawable
    this.arrowDrawable = Drawable.drawableInstances[ArrowIndicators.name][0]

    // Para de desenhar no cancel
    IO.addEventListener('cancel', () => (this.highlightedNode = null))
  }

  draw(drawer) {
    if (this.highlightedNode == null) return

    // Pega o carro e o cliente
    const car = this.highlightedNode.stepper.parentNode.stepper.source
    const client = this.highlightedNode.stepper.parentNode.stepper.destination

    this.drawRoute(
      this.highlightedNode.stepper.parentNode,
      selectedRouteHighlightBeforeRdv,
      drawer
    )

    this.drawRoute(this.highlightedNode, selectedRouteHighlight, drawer)

    // Desenha cliente
    client.draw(drawer)

    // Desenha carro
    car.draw(drawer)
  }

  drawRoute(node, color, drawer) {
    // Desenha uma linha de destaque das arestas
    const { strokePath, fillArc } = drawer.drawWith({
      style: color,
      lineWidth: 1.5 * streetWidth,
    })

    // Desenha o destaque
    this.drawHighlight(node, strokePath, fillArc, node.projectionCoords)

    // Desenha os vertices dos destaques
    this.drawVertices(node, drawer)

    // Desenha as ruas
    this.drawStreet(node, drawer)

    // Desenha as flechas
    this.drawArrows(node, drawer)

    // Desenha destaque da origem
    fillArc(node.stepper.source, 30)

    // Desenha destaque do fim
    fillArc(node.projectionCoords, 30)

    // Desenha trastejado do fim ao destino
    this.drawClientWalkLine(
      node.projectionCoords,
      node.stepper.destination,
      drawer,
      color
    )
  }

  // Desenha uma linha de destaque para o node fornecido e seus pais
  drawHighlight(node, strokePath, fillArc, destination) {
    if (node.parent != null) {
      strokePath(node.edge.source, destination ?? node.edge.destination)
      this.drawHighlight(node.parent, strokePath, fillArc)
    } else {
      strokePath(node.stepper.source, destination ?? node.edge.destination)
    }

    if (destination == null) fillArc(node.edge.destination, 0.75 * streetWidth)
  }

  drawVertices(node, drawer) {
    node.edge.destination.draw(drawer)

    if (node.parent != null) this.drawVertices(node.parent, drawer)
    else node.edge.source.draw(drawer)
  }

  // Desenha a rua para o node fornecido e seus pais
  drawStreet(node, drawer) {
    node.edge.draw(drawer)

    if (node.parent != null) this.drawStreet(node.parent, drawer)
  }

  drawArrows(node, drawer) {
    this.arrowDrawable.drawForEdge(node.edge, drawer)

    if (node.parent != null) this.drawArrows(node.parent, drawer)
  }

  drawClientWalkLine(client, rendezVous, drawer, color) {
    const { frettedPath } = drawer.drawWith({
      style: color,
      lineWidth: clientWalkPathWidth,
    })

    frettedPath(
      {
        gap: clientWalkPathLineGap,
        length: clientWalkPathLineSize,
      },
      client,
      rendezVous
    )
  }

  // Dado um node, destaca a rota correspondente
  static highlightRoute(node) {
    const instance = this.#getInstance()

    instance.highlightedNode = node
  }

  static #getInstance() {
    if (this.#instance == undefined) return new RouteHighlighter()
    else return this.#instance
  }
}
