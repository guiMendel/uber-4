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

  // Conhece todos os listeners dos botoes
  static buttonListeners = {}

  // Listeners
  static listeners = {
    mouserightdrag: [],
    leftclick: [],
    leftup: [],
    rightclick: [],
    rightup: [],
    cancel: [],
    mousemove: [],
  }

  // Guarda um callback que deve ser executado em vez de emitir um cancel no proximo comando de cancel
  static overrideCancelCallbacks = {}

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

        this.#raiseEvent('mousemove', {
          mapPosition: IO.mouse.mapCoords,
          screenPosition: IO.mouse.screenCoords,
          delta: { x: movementX, y: movementY },
        })
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
      if (button == 0) {
        IO.mouse.isLeftPressed = false
        this.#raiseEvent('leftup', {
          screen: { x: clientX, y: clientY },
          get map() {
            return Camera.ScreenToMap(clientX, clientY)
          },
        })
      } else if (button == 2) {
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
      if (event.code == 'Escape') this.triggerCancel()
    })
  }

  static addButtonListener(buttonName, listener) {
    if (this.buttonListeners[buttonName] == undefined) {
      this.buttonListeners[buttonName] = [listener]
    } else this.buttonListeners[buttonName].push(listener)
  }

  static triggerButton(buttonName, payload) {
    if (this.buttonListeners[buttonName] == undefined) return

    for (const listener of this.buttonListeners[buttonName]) listener(payload)
  }

  static addCancelCallback(id, callback) {
    this.overrideCancelCallbacks[id] = callback
  }

  static removeCancelCallback(id) {
    delete this.overrideCancelCallbacks[id]
  }

  static triggerCancel() {
    // Se houver override
    const cancelCallbacks = Object.entries(this.overrideCancelCallbacks)

    if (cancelCallbacks.length > 0) {
      const id = cancelCallbacks[0][0]
      const callback = cancelCallbacks[0][1]

      callback()
      delete this.overrideCancelCallbacks[id]

      return
    }

    // Somente se nao houver um override, raise
    this.#raiseEvent('cancel')
  }

  // Permite observar eventos
  static addEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `The IO class doesn't provide an eventListener of type "${type}"`
      )

    this.listeners[type].push(callback)
  }

  // Permite observar eventos
  static removeEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `The IO class doesn't provide an eventListener of type "${type}"`
      )

    const index = this.listeners[type].indexOf(callback)

    if (index == -1) return

    this.listeners[type].splice(index, 1)
  }

  // Permite levantar eventos
  static #raiseEvent(type, payload) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `Attempt to raise event of unknown type "${type}"`
      )

    for (const listener of this.listeners[type]) listener(payload)
  }
}
