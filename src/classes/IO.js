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

  // Conhece todos os botoes da UI
  static buttons = {}

  // Listeners
  static listeners = {
    mouserightdrag: [],
    leftclick: [],
    rightclick: [],
    rightup: [],
    cancel: [],
  }

  // Guarda um callback que deve ser executado em vez de emitir um cancel no proximo comando de cancel
  static overrideCancelCallback

  // Inicia as funcoes do IO
  static setup() {
    // Encontra o elemento canvas
    const canvas = document.getElementById('canvas')

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

    canvas.addEventListener('contextmenu', (e) => e.preventDefault())

    canvas.addEventListener('mousedown', ({ clientX, clientY, button }) => {
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

    window.addEventListener('mouseup', ({ clientX, clientY, button }) => {
      // Atualiza o estado
      if (button == 0) IO.mouse.isLeftPressed = false
      else if (button == 2) {
        IO.mouse.isRightPressed = false
        this.#raiseEvent('rightup', {
          screen: { x: clientX, y: clientY },
          get map() {
            return Camera.ScreenToMap(clientX, clientY)
          },
        })
      }
    })

    // Evento de cancelamento
    window.addEventListener('keyup', (event) => {
      if (event.code == 'Escape') {
        // Se houver um override
        if (this.overrideCancelCallback != null) {
          this.overrideCancelCallback()
          this.overrideCancelCallback = null
        }

        // Somente se nao houver um override, raise
        else this.#raiseEvent('cancel')
      }
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
