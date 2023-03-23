import Configuration from '../configuration/Configuration'
import Camera from './Camera'
import ArrowIndicators from './Drawables/ArrowIndicators'
import Car from './Drawables/Car'
import Client from './Drawables/Client'
import CarCreator from './Drawables/Creators/CarCreator'
import ClientCreator from './Drawables/Creators/ClientCreator'
import StreetCreator from './Drawables/Creators/StreetCreator'
import Debug from './Drawables/Debug'
import Drawable from './Drawables/Drawable'
import Edge from './Drawables/Edge'
import Vertex from './Drawables/Vertex'
import IO from './IO'
import Map from './Map'
import RouteCalculator from './RouteCalculator'

// Essa classe eh responsavel por acionar o modo simulacao e fazer os objetos se moverem e interagirem no tempo
export default class Simulation {
  static className = "Simulation"

  // Guarda o tempo atual passado na simulacao, em horas simuladas
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

    this.start()
    this.centerCamera()
    // Camera.reset()
  }

  static centerCamera() {
    const xSorted = Vertex.sortedCoords.get('x')
    const ySorted = Vertex.sortedCoords.get('y')

    // Coloca o deslocamento no centro de massa dos vertices
    Camera.translation = {
      x:
        xSorted.length == 0
          ? window.innerWidth / 2
          : window.innerWidth / 2 -
            (xSorted[0].x + xSorted[xSorted.length - 1].x) / 2,
      y:
        ySorted.length == 0
          ? window.innerHeight / 2
          : window.innerHeight / 2 -
            (ySorted[0].y + ySorted[ySorted.length - 1].y) / 2,
    }
  }

  static cancelToken = { cancelled: true }

  static get isRunning() {
    return this.cancelToken.cancelled == false
  }

  static start() {
    // Inicializa a contagem de tempo
    this.#lastStepRealTime = Date.now()

    // Inicaliza um cancel token
    this.cancelToken.cancelled = false

    // Levanta
    this.#raiseEvent('start')

    // Inicializa a simulacao
    this.simulation()
  }

  static stop() {
    this.cancelToken.cancelled = true
  }

  static reset() {
    this.stop()

    this.#time = 0

    CarCreator.getInstance().reset()
    ClientCreator.getInstance().reset()
    StreetCreator.getInstance().reset()
    Drawable.resetAll()
    Edge.resetAll()
    Vertex.resetAll()
    Car.resetAll()
    Client.resetAll()
    new ArrowIndicators()
    new CarCreator()
    new ClientCreator()
    new StreetCreator()

    const debug = Debug.getInstance()
    Debug.instances[debug.id] = debug
  }

  static async simulation(cancelToken) {
    // Roda indefinidamente
    while (this.isRunning) {
      const { timescale } = Configuration.getInstance().general

      // Conta a passagem de tempo. Convertemos de segundos reais para horas simuladas
      const deltaTime = Date.now() - this.#lastStepRealTime

      this.time += (deltaTime / 1000) * timescale
      this.#lastStepRealTime += deltaTime

      // Passa por cada entidade
      for (const drawableClass of Object.values(Drawable.drawableInstances)) {
        for (const drawable of Object.values(drawableClass)) {
          // Executa um step da simulacao
          drawable.simulationStep((deltaTime / 1000) * timescale)
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
        `The ${this.className} class doesn't provide an eventListener of type "${type}"`
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
