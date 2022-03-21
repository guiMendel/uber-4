import theme from '../configuration/theme'
import Drawable from './Drawable'
import Edge from './Edge'

const {
  streetArrowsColor,
  streetArrowHeight,
  streetArrowInterval,
  streetWidth,
} = theme

// Helpers
// Trigonometry
const sin = (angle) => Math.sin(angle * (Math.PI / 180))
const cos = (angle) => Math.cos(angle * (Math.PI / 180))

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
  draw(context) {
    // Para cada aresta
    for (const edge of Object.values(Drawable.drawableInstances[Edge.name])) {
      // A comecar da origem da aresta, desenhar flechas ao longo dela, e ir deslocando o ponto de desenho
      let displacement = 0

      // Enquanto ainda couberem flechas
      while (displacement + streetArrowHeight <= edge.mapDistance) {
        this.drawArrow(
          edge.source.x + displacement * sin(edge.angle),
          edge.source.y + displacement * cos(edge.angle),
          edge.angle,
          context
        )

        // Aumenta o deslocamento
        displacement += streetArrowInterval
      }
    }
  }

  // x e y devem apontar para o centro da base do triangulo
  drawArrow(x, y, pointAngle, context) {
    // Permite obter as coordenadas x, y desloacadas no angulo indicado, numa distancia indicada
    // Ja torna o angulo relativo ao angulo de rotacao do triangulo, e soma 90 para que 0 seja a direita
    const displacement = (amount, angle) => [
      x + amount * sin(angle + pointAngle),
      y + amount * cos(angle + pointAngle),
    ]

    context.beginPath()

    context.strokeStyle = streetArrowsColor

    context.lineWidth = streetWidth / 5

    // Comecar na extremidade esquerda da base
    context.moveTo(...displacement((streetWidth - 2) / 2, 90))

    // Linha ate a ponta do triangulo
    context.lineTo(...displacement(streetArrowHeight, 0))

    // Linha ate a extremidade direita do triangulo
    context.lineTo(...displacement((streetWidth - 2) / 2, 270))

    context.stroke()
  }
}
