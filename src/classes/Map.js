import delay from '../helpers/delay'
import theme from '../configuration/theme'
import appConfig from '../configuration/appConfig'
import seedGraph from '../helpers/seedGraph'
import Drawable from './Drawable'
import ArrowIndicators from './ArrowIndicators'

import whiteCar from '../assets/white-car.png'
import man from '../assets/man.png'
import woman from '../assets/woman.png'
import man2 from '../assets/man2.png'

// Extrai valores uteis
const { streetWidth } = theme

// Classe singleton que governa o mapa, os desenhos do mapa e suas atualizacoes
export default class Map {
  // Guarda a unica instancia do mapa
  static instance = null

  constructor(canvasContext) {
    // Se ja ha uma instancia, use ela
    if (Map.instance != undefined) return Map.instance

    // Define o singleton
    Map.instance = this

    // Armazena o contexto para desenhar
    this.context = canvasContext

    // Inica as iteracoes
    const start = async () => {
      // Gera um grafo de teste
      seedGraph()

      // Cria o singleton ArrowIndicators
      new ArrowIndicators()

      while (true) {
        // Renderiza uma frame
        Drawable.drawScreen(this.context)

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
        this.loadImage(whiteCar, streetWidth + 2).then(
          (carImage) => (this.carImage = carImage)
        ),

        // Carrega o man
        this.loadImage(man, streetWidth * 0.6).then((image) =>
          this.clientImage.push(image)
        ),

        // Carrega o man2
        this.loadImage(man2, streetWidth * 0.6).then((image) =>
          this.clientImage.push(image)
        ),

        // Carrega a woman
        this.loadImage(woman, streetWidth * 0.6).then((image) =>
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
