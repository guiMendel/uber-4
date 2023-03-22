import generateRandomMap from '../helpers/mapGenerators/generateRandomMap'
import delay from '../helpers/delay'
import Configuration from '../configuration/Configuration'
import ArrowIndicators from './Drawables/ArrowIndicators'

import redCar from '../assets/red-car.png'
import whiteCar from '../assets/white-car.png'
import man from '../assets/man.png'
import woman from '../assets/woman.png'
import man2 from '../assets/man2.png'
import IO from './IO'
import Camera from './Camera'
import Drawer from './Drawer'
import Client from './Drawables/Client'
import RouteCalculator from './RouteCalculator'
import Simulation from './Simulation'
import Debug from './Drawables/Debug'
import RouteHighlighter from './Drawables/RouteHighlighter'
import ClientCreator from './Drawables/Creators/ClientCreator'
import StreetCreator from './Drawables/Creators/StreetCreator'
import Car from './Drawables/Car'
import CarCreator from './Drawables/Creators/CarCreator'
import Drawable from './Drawables/Drawable'
import generateCityBlocks from '../helpers/mapGenerators/generateCityBlocks.'
import Vertex from './Drawables/Vertex'

// Classe singleton que governa o mapa, os desenhos do mapa e suas atualizacoes
export default class Map {
  // Guarda a unica instancia do mapa
  static instance = null

  // Guarda qual classe de interacao com o usuario esta atualmente em atividade
  static #activeInteractionClass = null

  static get activeInteractionClass() {
    return this.#activeInteractionClass
  }

  static set activeInteractionClass(value) {
    const oldValue = this.#activeInteractionClass

    this.#activeInteractionClass = value

    this.#raiseEvent('activateinteractionclass', { value, oldValue })
  }

  // Guarda todos os cursores que estao atualmente tentado ser mostrados (mostra o mais recente)
  static activeCursors = []

  // Permite que os agentes saibam qual versao do mapa este eh
  // A versao muda sempre que algo eh modificado ou removido do mapa (introducoes nao alteram a versao)
  static version = 1

  // Listeners
  static listeners = {
    activateinteractionclass: [],
    newframe: [],
    error: [],
  }

  static get lowestX() {
    return Vertex.sortedCoords.get('x')[0].x
  }

  static get lowestY() {
    return Vertex.sortedCoords.get('y')[0].y
  }

  static get highestX() {
    const sorted = Vertex.sortedCoords.get('x')

    return sorted[sorted.length - 1].x
  }

  static get highestY() {
    const sorted = Vertex.sortedCoords.get('y')

    return sorted[sorted.length - 1].y
  }

  // Initializes map given a method and parameters
  generateMap(method, parameters) {
    // Destroy previous map
    if (method == 'random') {
      generateRandomMap(
        parameters.numberOfVertices,
        parameters.numberOfCars,
        parameters.initialClients,
        parameters.mapWidth,
        parameters.mapHeight,
        parameters.minDistanceBetweenVertices
      )
    }

    if (method == 'city-blocks') {
      generateCityBlocks(
        parameters.numberOfBlocks,
        parameters.blockSize,
        parameters.numberOfCars,
        parameters.initialClients,
        parameters.blocksAngle,
        parameters.vertexOmitChance,
        parameters.edgeOmitChance,
        parameters.lowSpeedLaneProportion,
        parameters.highSpeedLaneProportion
      )
    }
  }

  constructor(canvasContext, { method, parameters }) {
    // Se ja ha uma instancia, use ela
    // if (Map.instance != undefined) return Map.instance
    if (Map.instance != undefined) throw new Error('Duplicating map instance')

    // Define o singleton
    Map.instance = this

    // Inicia as iteracoes
    const start = async () => {
      // Configura IO
      IO.setup()

      // Inicializa a camera
      Camera.setup(canvasContext)

      // Generate map
      this.generateMap(method, parameters)

      Car.setup()
      Client.setup()
      RouteCalculator.setup()
      Simulation.setup()

      // Cria os Singletons
      new ArrowIndicators()

      new Debug()

      new RouteHighlighter()

      new ClientCreator()

      new StreetCreator()

      new CarCreator()

      // Armazena o wrapper de contexto para desenhar
      this.drawer = new Drawer(canvasContext)

      while (true) {
        console.log('frame start')
        Map.#raiseEvent('newframe')

        // Renderiza uma frame
        this.drawer.drawFrame()

        // Espera o tempo de fps
        console.log('wait frame')
        await delay(1 / Configuration.getInstance().general.maxFramesPerSecond)
        console.log('frame end')
      }
    }

    // Carrega as imagens, e entao inicia o app
    this.loadAssets().then(start)
  }

  static announceError(error) {
    if (typeof error == 'string') this.#raiseEvent('error', error)
    else {
      this.#raiseEvent('error', error.message)
    }
  }

  static advanceVersion() {
    this.version++
  }

  static setCursor(newCursor) {
    this.activeCursors.push(newCursor)

    // Atualiza a classe de body com base no cursor
    document.body.className = newCursor
  }

  static removeCursor(cursor) {
    this.activeCursors.splice(
      this.activeCursors.findIndex((activeCursor) => activeCursor == cursor),
      1
    )

    document.body.className = this.activeCursors[0]
  }

  // Resolve assim que um novo frame comecar
  static async endOfFrame() {
    return new Promise((resolve) => {
      function resolveAndUnsubscribe() {
        resolve()
        Map.removeEventListener('newframe', resolveAndUnsubscribe)
      }

      this.addEventListener('newframe', resolveAndUnsubscribe)
    })
  }

  async loadAssets() {
    return new Promise((resolve, reject) => {
      const { carWidth, clientWidth } = Configuration.getInstance().theme

      // Prepara um array para armazenar as imagens de clientes
      this.clientImage = []

      // Carrega todas as imagens
      Promise.all([
        // Carrega o carro
        this.loadImage(whiteCar, carWidth).then(
          (carImage) => (this.carImage = carImage)
        ),

        this.loadImage(redCar, carWidth).then(
          (carImage) => (this.redCarImage = carImage)
        ),

        // Carrega o man
        this.loadImage(man, clientWidth).then((image) =>
          this.clientImage.push(image)
        ),

        // Carrega o man2
        this.loadImage(man2, clientWidth).then((image) =>
          this.clientImage.push(image)
        ),

        // Carrega a woman
        this.loadImage(woman, clientWidth).then((image) =>
          this.clientImage.push(image)
        ),
      ]).then(resolve)
    })
  }

  async loadImage(imagePath, setWidth) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = imagePath

      // Quando a imagem carregar, resolve
      image.onload = () => {
        // Ajusta as dimensoes da imagem
        if (setWidth != undefined) {
          // Set new height
          image.height = (setWidth * image.height) / image.width

          // Set the new width
          image.width = setWidth
        }

        resolve(image)
      }
    })
  }

  // Permite observar eventos
  static addEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `The Map class doesn't provide an eventListener of type "${type}"`
      )

    this.listeners[type].push(callback)
  }

  // Permite observar eventos
  static removeEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `The Map class doesn't provide an eventListener of type "${type}"`
      )

    const index = this.listeners[type].indexOf(callback)

    if (index == -1) return

    this.listeners[type].splice(index, 1)
  }

  // Permite levantar eventos
  static #raiseEvent(type, payload) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `Tentativa em Map de levantar evento de tipo inexistente "${type}"`
      )

    for (const listener of this.listeners[type]) listener(payload)
  }
}
