import delay from '../helpers/delay'
import theme from '../configuration/theme'
import appConfig from '../configuration/appConfig'
import Vertex from './Vertex'
import Edge from './Edge'
import whiteCar from '../assets/white-car.png'

// Extrai valores uteis
const { mapBackground, streetWidth } = theme

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
        this.renderFrame()

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

  renderFrame() {
    // Limpa desenhos e carrega background
    this.context.fillStyle = mapBackground
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight)

    // Renderiza os vertices e arestas
    this.renderGraph()

    // Renderiza os carros
    this.context.drawImage(
      this.carImage,
      50,
      50,
      this.carImage.width,
      this.carImage.height
    )
  }

  renderGraph() {
    // Para cada vertice
    for (const vertex of Object.values(Vertex.vertices))
      vertex.draw(this.context)

    // Para cada aresta
    for (const edge of Object.values(Edge.edges)) edge.draw(this.context)

    // Rendreiza as indicacoes de sentido das ruas
    Edge.drawStreetPointers(this.context)
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
