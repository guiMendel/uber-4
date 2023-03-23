import Drawable from './Drawable'

// Singleton que fornece metodos para debug
export default class Debug extends Drawable {
  static className = 'Debug'

  static #instance = null

  // Stores which lines to draw
  drawLines = {}

  nextLineId = 0

  constructor() {
    if (Debug.#instance != undefined) return Debug.#instance

    super(1, {})

    Debug.#instance = this
  }

  draw(drawer) {
    const { strokePath } = drawer.drawWith({ style: 'violet', lineWidth: 5 })

    // Draw every line
    for (const line of Object.values(this.drawLines))
      strokePath(line[0], line[1])
  }

  // Passa a desenhar uma linha entre os 2 pontos
  // Retorna um metodo para apagar o desenho
  static drawLine(pointA, pointB) {
    const instance = this.getInstance()

    const lineId = instance.nextLineId++

    instance.drawLines[lineId] = [pointA, pointB]

    return () => delete instance.drawLines[lineId]
  }

  static getInstance() {
    if (this.#instance == undefined) return new Debug()
    else return this.#instance
  }
}
