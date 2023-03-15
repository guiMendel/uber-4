import generateRandomMap from '../helpers/mapGenerators/generateRandomMap'
import delay from '../helpers/delay'
import theme from '../configuration/theme'
import appConfig from '../configuration/appConfig'
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

// Extrai valores uteis
const { carWidth, clientWidth } = theme

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

  // Initializes map given a method and parameters
  generateMap(method, parameters) {
    // Destroy previous map
    Drawable.drawableInstances = {}

    if (method == 'random') {
      generateRandomMap(
        parameters.numberOfVertices,
        parameters.numberOfCars,
        parameters.numberOfClients,
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
        parameters.numberOfClients,
        parameters.blocksAngle,
        parameters.vertexOmitChance,
        parameters.edgeOmitChance,
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
        Map.#raiseEvent('newframe')

        // Renderiza uma frame
        this.drawer.drawFrame()

        // Espera o tempo de fps
        await delay(1 / appConfig.maxFramesPerSecond)
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
        `A classe Map nao fornece um eventListener do tipo "${type}"`
      )

    this.listeners[type].push(callback)
  }

  // Permite observar eventos
  static removeEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `A classe Map nao fornece um eventListener do tipo "${type}"`
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
