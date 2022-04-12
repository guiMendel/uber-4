import Drawable from './Drawables/Drawable'
import IO from './IO'
import Map from './Map'
import RouteCalculator from './RouteCalculator'

// Essa classe eh responsavel por acionar o modo simulacao e fazer os objetos se moverem e interagirem no tempo
export default class Simulation {
  // Guarda o tempo atual passado na simulacao, em segundos
  static #time = 0

  static get time() {
    return this.#time
  }

  static set time(value) {
    this.#time = value
    this.#raiseEvent('timepass', value)
  }

  // Tempo real medido na utlima iteracao, em ms
  static #lastStepRealTime = null

  static setup() {
    IO.addButtonListener('toggle-simulation', ({ value }) =>
      value ? this.start() : this.stop()
    )
  }

  static start() {
    // Inicializa a contagem de tempo
    this.#lastStepRealTime = Date.now()

    // Inicaliza um cancel token
    const cancelToken = { cancelled: false }

    // Levanta
    this.#raiseEvent('start')

    // Atribui rotas aos carros e clientes que faltam
    RouteCalculator.calculateForRemainingClients()

    // Inicializa a simulacao
    this.simulation(cancelToken)

    // Fornece um meio de interromper a simulacao
    this.stop = () => (cancelToken.cancelled = true)
  }

  static stop() {}

  static async simulation(cancelToken) {
    // Roda indefinidamente
    while (cancelToken.cancelled == false) {
      // Conta a passagem de tempo
      const deltaTime = Date.now() - this.#lastStepRealTime

      this.time += deltaTime / 1000
      this.#lastStepRealTime += deltaTime

      // Passa por cada entidade
      for (const drawableClass of Object.values(Drawable.drawableInstances)) {
        for (const drawable of Object.values(drawableClass)) {
          // Executa um step da simulacao
          drawable.simulationStep(deltaTime)
        }
      }

      // Espera o fim do frame
      await Map.endOfFrame()
    }
  }

  static listeners = { timepass: [], start: [] }

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
