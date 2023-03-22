import Configuration from '../../configuration/Configuration'
import ArrowIndicators from './ArrowIndicators'
import Drawable from './Drawable'

// Este singleton permite destacar as arestas que compoem uma rota
export default class RouteHighlighter {
  static #instance

  constructor() {
    if (RouteHighlighter.#instance != undefined)
      return RouteHighlighter.#instance

    RouteHighlighter.#instance = this

    // Guarda uma referencia ao arrow drawable
    this.arrowDrawable = Drawable.drawableInstances[ArrowIndicators.name][0]
  }

  draw(drawer, highlightedNode) {
    const { selectedRouteHighlight, selectedRouteHighlightBeforeRdv } =
      Configuration.getInstance().theme

    // Pega o carro e o cliente
    const { car, client } = highlightedNode.stepper

    // Se ja estiver apos a fase 1, nao desenha a primeira rota
    if (client.routePhase <= 1)
      this.drawRoute(
        highlightedNode.stepper.parentNode,
        selectedRouteHighlightBeforeRdv,
        drawer
      )

    this.drawRoute(highlightedNode, selectedRouteHighlight, drawer)

    // Desenha as flechas da primeira rota
    if (client.routePhase <= 1)
      this.drawArrows(highlightedNode.stepper.parentNode, drawer)

    // Desenha as flechas
    this.drawArrows(highlightedNode, drawer)

    // Desenha carro
    car.draw(drawer)
  }

  drawRoute(node, color, drawer) {
    // Desenha uma linha de destaque das arestas
    const { strokePath, fillArc } = drawer.drawWith({
      style: color,
      lineWidth: 1.5 * Configuration.getInstance().theme.streetWidth,
    })

    // Desenha o destaque
    this.drawHighlight(node, strokePath, fillArc, node.projectionCoords)

    // Desenha os vertices dos destaques
    this.drawVertices(node, drawer)

    // Desenha as ruas
    this.drawStreet(node, drawer)

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

    if (destination == null)
      fillArc(
        node.edge.destination,
        0.75 * Configuration.getInstance().theme.streetWidth
      )
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
    const {
      clientWalkPathWidth,
      clientWalkPathLineGap,
      clientWalkPathLineSize,
    } = Configuration.getInstance().theme

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

  static drawClientWalkRoute(client, drawer) {
    const { streetWidth, selectedRouteHighlight } =
      Configuration.getInstance().theme

    const instance = this.getInstance()

    instance.drawClientWalkLine(
      client,
      client.destination,
      drawer,
      selectedRouteHighlight
    )

    const { fillArc } = drawer.drawWith({
      style: selectedRouteHighlight,
      lineWidth: 1.5 * streetWidth,
    })

    fillArc(client, 30)
    fillArc(client.destination, 30)
  }

  // Dado um node, destaca a rota correspondente
  static highlightRoute(node, drawer) {
    const instance = this.getInstance()

    instance.draw(drawer, node)
  }

  static getInstance() {
    if (this.#instance == undefined) return new RouteHighlighter()
    else return this.#instance
  }
}
