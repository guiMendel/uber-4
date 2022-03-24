import delay from '../helpers/delay'
import theme from '../configuration/theme'
import appConfig from '../configuration/appConfig'
import seedGraph from '../helpers/seedGraph'
import ArrowIndicators from './Drawables/ArrowIndicators'

import whiteCar from '../assets/white-car.png'
import man from '../assets/man.png'
import woman from '../assets/woman.png'
import man2 from '../assets/man2.png'
import IO from './IO'
import Camera from './Camera'
import Drawer from './Drawer'
import Client from './Drawables/Client'
import RouteCalculator from './RouteCalculator'
import Debug from './Drawables/Debug'

// Extrai valores uteis
const { streetWidth, carWidth, clientWidth } = theme

// Classe singleton que governa o mapa, os desenhos do mapa e suas atualizacoes
export default class Map {
  // Guarda a unica instancia do mapa
  static instance = null

  constructor(canvasContext) {
    // Se ja ha uma instancia, use ela
    if (Map.instance != undefined) return Map.instance

    // Define o singleton
    Map.instance = this

    // Inica as iteracoes
    const start = async () => {
      // Configura IO
      IO.setup()

      // Inicializa a camera
      Camera.setup(canvasContext)

      // Gera um grafo de teste
      seedGraph()

      Client.setup()
      RouteCalculator.setup()

      // Cria o singleton ArrowIndicators
      new ArrowIndicators()

      new Debug()

      // Armazena o wrapper de contexto para desenhar
      this.drawer = new Drawer(canvasContext)

      while (true) {
        // Renderiza uma frame
        this.drawer.drawFrame()

        // Espera o tempo de fps
        await delay(1 / appConfig.maxFramesPerSecond)
      }
    }

    // Carrega as imagens, e entao inicia o app
    this.loadAssets().then(start)
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
}
