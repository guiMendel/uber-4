import theme from '../../../configuration/theme'
import { angleBetween, getDistance } from '../../../helpers/vectorDistance'
import IO from '../../IO'
import ArrowIndicators from '../ArrowIndicators'
import Drawable from '../Drawable'
import Edge from '../Edge'
import Vertex from '../Vertex'
import Creator from './Creator'

const { streetColorSlowest, streetWidth } = theme

// Permite criar novos vertices e arestas
export default class StreetCreator extends Creator {
  // A velocidade das ruas a serem criadas
  streetSpeed = null

  // De qual vertice a proxima rua a ser desenhada deve sair
  sourceVertex = null

  constructor() {
    super()

    // Guarda uma referencia ao arrow drawable
    this.arrowDrawable = Drawable.drawableInstances[ArrowIndicators.name][0]
  }

  onDraw(drawer) {
    const { fillArc, strokePath } = drawer.drawWith({
      style: streetColorSlowest,
      opacity: 0.5,
      lineWidth: streetWidth,
    })

    // Desenha um pontinho no cursor
    fillArc(IO.mouse.mapCoords, streetWidth / 2)

    // Se tiver um source
    if (this.sourceVertex == null) return

    // Desenha um pontinho nele
    fillArc(this.sourceVertex, streetWidth / 2)

    // Desenha um caminho do source ate o mouse
    strokePath(this.sourceVertex, IO.mouse.mapCoords)

    // Desenha as setas
    this.drawArrows(this.sourceVertex, IO.mouse.mapCoords, drawer)
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
    // Se nao tinha um source, criar um source virtual
    if (this.sourceVertex == null) {
      this.sourceVertex = { ...position.map, isVirtual: true }

      return
    }

    // Se ja tinha um source, cria o vertice do fim da rua
    const destination = new Vertex(
      undefined,
      position.map.x,
      position.map.y,
      true
    )

    // Se o source eh virutal, cria ele tb
    if (this.sourceVertex.isVirtual)
      this.sourceVertex = new Vertex(
        undefined,
        this.sourceVertex.x,
        this.sourceVertex.y,
        true
      )

    // Cria a rua entre os vertices
    new Edge(undefined, this.sourceVertex, destination, {
      mapSpeed: this.streetSpeed,
    })

    // Avanca o source para o destination
    this.sourceVertex = destination
  }

  onCancel() {
    this.sourceVertex = null
    this.streetSpeed = null
  }

  // Permite que o componente de configuracoes configure essa velocidade
  static setStreetSpeed(value) {
    this.getInstance().streetSpeed = value
  }
}
