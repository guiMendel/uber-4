import Drawable from './Drawables/Drawable'
import IO from './IO'

// Define uma classe que permite deslocar a visao do canvas
export default class Camera extends Drawable {
  // Armazena qual deslocamento esta sendo aplicado ao canvas atualmente
  static #translation = { x: null, y: null }

  // Armazena o context
  static #context

  static get translation() {
    return this.#translation
  }

  static set translation(value) {
    this.#translation = value

    // Desloca a camera
    this.#context.setTransform(
      1,
      0,
      0,
      1,
      this.#translation.x,
      this.#translation.y
    )
  }

  // Inicia as funcoes da Camera
  static setup(context) {
    this.#context = context

    // Desloca a visao para a origem
    this.reset()

    // Sempre que usuario arrastar com botao direito, desloque a camera
    IO.addEventListener('mouserightdrag', this.translate)
  }

  // Move a camera
  static translate({ x, y }) {
    Camera.translation = {
      x: Camera.translation.x + x,
      y: Camera.translation.y + y,
    }
  }

  // Centraliza a camera na origem
  static reset() {
    // Coloca o deslocamento no centro
    Camera.translation = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  }

  // Translate coordenadas relativas a screen para map
  static ScreenToMap(x, y) {
    return { x: x - Camera.translation.x, y: y - Camera.translation.y }
  }

  // Translate coordenadas relativas a map para screen
  static MapToScreen(x, y) {
    return { x: x + Camera.translation.x, y: y + Camera.translation.y }
  }

  constructor() {
    super(1, {})
  }

  draw(drawer) {
    // Desenha um arco em sua posicao
    const { fillArc } = drawer.drawWith({ style: 'red' })

    fillArc({ x: 0, y: 0 }, 2)
  }
}
