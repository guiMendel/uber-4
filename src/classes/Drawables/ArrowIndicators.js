import theme from '../../configuration/theme'
import { sin, cos } from '../../helpers/trygonometry'
import Drawable from './Drawable'
import Edge from './Edge'

const {
  streetArrowColor,
  streetArrowHeight,
  streetArrowInterval,
  streetWidth,
  streetArrowWidth,
} = theme

// Define como desenhar as flechas que indicam o sentido de uma rua
export default class ArrowIndicators extends Drawable {
  constructor() {
    // Sera um singleton
    if (
      Drawable.drawableInstances[ArrowIndicators.name] &&
      Drawable.drawableInstances[ArrowIndicators.name][0] != undefined
    )
      return Drawable.drawableInstances[ArrowIndicators.name][0]

    super(0, {})
  }

  // Desenha triangulos de direcao para cada rua
  draw(drawer) {
    // Para cada aresta
    for (const edge of Object.values(Drawable.drawableInstances[Edge.name])) {
      this.drawForEdge(edge, drawer)
    }
  }

  // Desenha as setas da aresta fornecida
  drawForEdge(edge, drawer, options) {
    // A comecar da origem da aresta, desenhar flechas ao longo dela, e ir deslocando o ponto de desenho
    let displacement = 0

    // Enquanto ainda couberem flechas
    while (displacement + streetArrowHeight <= edge.mapDistance) {
      this.drawArrow(
        edge.source.x + displacement * sin(edge.angle + 90),
        edge.source.y + displacement * cos(edge.angle + 90),
        edge.angle + 90,
        drawer,
        options
      )

      // Aumenta o deslocamento
      displacement += streetArrowInterval
    }
  }

  // x e y devem apontar para o centro da base do triangulo
  drawArrow(x, y, pointAngle, drawer, options) {
    // Permite obter as coordenadas x, y desloacadas no angulo indicado, numa distancia indicada
    // Ja torna o angulo relativo ao angulo de rotacao do triangulo, e soma 90 para que 0 seja a direita
    const displacement = (amount, angle) => ({
      x: x + amount * sin(angle + pointAngle),
      y: y + amount * cos(angle + pointAngle),
    })

    const { strokePath } = drawer.drawWith({
      style: streetArrowColor,
      lineWidth: streetArrowWidth,
      ...options,
    })

    strokePath(
      displacement((streetWidth - 2) / 2, 90),
      displacement(streetArrowHeight, 0),
      displacement((streetWidth - 2) / 2, 270)
    )
  }
}
