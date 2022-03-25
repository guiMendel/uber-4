import theme from '../../configuration/theme'
import IO from '../IO'
import ArrowIndicators from './ArrowIndicators'
import Drawable from './Drawable'

const {
  selectedRouteHighlight,
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

    // Desenha uma linha de destaque das arestas
    const { strokePath, fillArc } = drawer.drawWith({
      style: selectedRouteHighlight,
      lineWidth: 1.5 * streetWidth,
    })

    this.drawHighlight(
      this.highlightedNode,
      strokePath,
      fillArc,
      this.highlightedNode.projectionCoords
    )

    this.drawVertices(this.highlightedNode, drawer)

    this.drawStreet(this.highlightedNode, drawer)

    this.drawArrows(this.highlightedNode, drawer)

    // Draw the car
    fillArc(this.highlightedNode.stepper.source, 30)

    fillArc(this.highlightedNode.projectionCoords, 30)

    this.drawClientWalkLine(
      this.highlightedNode.stepper.destination,
      this.highlightedNode.projectionCoords,
      drawer
    )

    this.highlightedNode.stepper.source.draw(drawer)

    this.highlightedNode.stepper.destination.draw(drawer)
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

  drawClientWalkLine(client, rendezVous, drawer) {
    const { frettedPath } = drawer.drawWith({
      style: selectedRouteHighlight,
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
