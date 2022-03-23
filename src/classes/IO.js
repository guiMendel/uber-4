import Camera from './Camera'

// Este modulo fornece facilidade para realizar IO com o mapa
export default class IO {
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
  static listeners = {
    mouserightdrag: [],
    leftclick: [],
    rightclick: [],
    cancel: [],
  }

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

    window.addEventListener('mousedown', ({ clientX, clientY, button }) => {
      // Atualiza o estado
      if (button == 0) {
        IO.mouse.isLeftPressed = true
        this.#raiseEvent('leftclick', {
          screen: { x: clientX, y: clientY },
          get map() {
            return Camera.ScreenToMap(clientX, clientY)
          },
        })
      } else if (button == 2) {
        IO.mouse.isRightPressed = true
        this.#raiseEvent('rightclick', {
          screen: { x: clientX, y: clientY },
          get map() {
            return Camera.ScreenToMap(clientX, clientY)
          },
        })
      }
    })

    window.addEventListener('mouseup', ({ button }) => {
      // Atualiza o estado
      if (button == 0) IO.mouse.isLeftPressed = false
      else if (button == 2) IO.mouse.isRightPressed = false
    })

    // Evento de cancelamento
    window.addEventListener('keyup', (event) => {
      if (event.code == 'Escape') this.#raiseEvent('cancel')
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
}
