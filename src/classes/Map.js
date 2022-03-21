import delay from '../helpers/delay'
import theme from '../configuration/theme'
import appConfig from '../configuration/appConfig'
import whiteCar from '../assets/white-car.png'
import Drawable from './Drawable'

// Extrai valores uteis
const { streetWidth } = theme

// Classe que governa o mapa, os desenhos do mapa e suas atualizacoes
export default class Map {
  constructor(canvasContext) {
    // Armazena o contexto para desenhar
    this.context = canvasContext
    // this.context.imageSmoothingEnabled = false
    // Tempo pelo qual permanece ativo
    this.active = true

    // Inica as iteracoes
    const start = async () => {
      while (this.active) {
        // Renderiza uma frame
        Drawable.drawScreen(this.context)

        // Espera o tempo de fps
        await delay(1 / appConfig.maxFramesPerSecond)
      }
    }

    // Carrega as imagens, e entao inicia o app
    this.loadAssets().then(start)
  }

  disable() {
    this.active = false
  }

  async loadAssets() {
    return new Promise((resolve, reject) => {
      // Carrega todas as imagens
      Promise.all([
        // Carrega o carro
        this.loadImage(whiteCar, streetWidth + 2).then(
          (carImage) => (this.carImage = carImage)
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
