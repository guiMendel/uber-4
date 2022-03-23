import Camera from './Camera'
import Drawable from './Drawables/Drawable'

// Este modulo fornece facilidade para realizar IO com o mapa
export default class IO extends Drawable {
  // Conhece a atual posicao do cursor em tela
  static mouse = {
    // Coordenadas
    screenCoords: { x: null, y: null },
    get mapCoords() {
      return Camera.ScreenToMap(this.screenCoords.x, this.screenCoords.y)
    },

    // Estado

    // Botao direito pressionado
    isRightPressed: false,

    // Botao esquerdo pressionado
    isLeftPressed: false,
  }

  // Listeners
  static listeners = { mouserightdrag: [] }

  // Inicia as funcoes do IO
  static setup() {
    // Mantem a posicao do cursor atualizada
    window.addEventListener(
      'mousemove',
      ({ clientX, clientY, movementX, movementY }) => {
        IO.mouse.screenCoords.x = clientX
        IO.mouse.screenCoords.y = clientY

        // Levanta evento de drag se estiver pressionando com botao direito
        if (IO.mouse.isRightPressed)
          this.#raiseEvent('mouserightdrag', { x: movementX, y: movementY })
      }
    )

    window.addEventListener('contextmenu', (e) => e.preventDefault())

    window.addEventListener('mousedown', ({ button }) => {
      // Atualiza o estado
      if (button == 0) IO.mouse.isLeftPressed = true
      else if (button == 2) IO.mouse.isRightPressed = true
    })

    window.addEventListener('mouseup', ({ button }) => {
      // Atualiza o estado
      if (button == 0) IO.mouse.isLeftPressed = false
      else if (button == 2) IO.mouse.isRightPressed = false
    })
  }

  // Permite observar eventos
  static addEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `A classe IO nao fornece um eventListener do tipo "${type}"`
      )

    this.listeners[type].push(callback)
  }

  // Permite levantar eventos
  static #raiseEvent(type, payload) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `Tentativa em IO de levantar evento de tipo inexistente "${type}"`
      )

    for (const listener of this.listeners[type]) listener(payload)
  }

  constructor() {
    // Chama super
    super(1, {})
  }

  draw(drawer) {
    // Desenha um arco em sua posicao
    const { fillArc } = drawer.drawWith({ style: 'blue' })

    fillArc(IO.mouse.mapCoords, 10)
  }
}
