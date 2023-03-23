import Configuration from '../configuration/Configuration'
import { cos, sin } from '../helpers/trigonometry'
import { angleBetween, getDistance } from '../helpers/vectorDistance'
import IO from './IO'
import Map from './Map'
import Random from './Random'

const initialWanderSpeed = 1
const wanderMirrorVariation = 0.8
const wanderSlack = 100

// Define uma classe que permite deslocar a visao do canvas
export default class Camera {
  static className = "Camera"
  
  // Para qual posicao deslocar a camera a cada frame
  static panDestination = { x: null, y: null }

  // Armazena qual deslocamento esta sendo aplicado ao canvas atualmente
  static #translation = { x: null, y: null }

  // Armazena o context
  static #context

  static wander = true

  static get translation() {
    return this.#translation
  }

  static set translation(value) {
    this.#translation = value

    // Desloca a camera
    this.#context.setTransform(
      1,
      0,
      0,
      1,
      this.#translation.x,
      this.#translation.y
    )
  }

  static get position() {
    return {
      x: window.innerWidth / 2 - this.translation.x,
      y: window.innerHeight / 2 - this.translation.y,
    }
  }

  static set position(value) {
    this.translation = {
      x: window.innerWidth / 2 - value.x,
      y: window.innerHeight / 2 - value.y,
    }
  }

  static wanderVelocity = { x: 0, y: 0 }

  static update() {
    this.pan()

    if (this.wander == false) return

    if (this.wanderVelocity.x == 0 || this.wanderVelocity.y == 0) {
      const angle = Random.rangeFloat(0, 2 * Math.PI)

      this.wanderVelocity = {
        x: initialWanderSpeed * Math.cos(angle),
        y: initialWanderSpeed * Math.sin(angle),
      }
    }

    // Apply velocity
    this.translate({ x: -this.wanderVelocity.x, y: -this.wanderVelocity.y })

    const rotate = (angle) => {
      this.wanderVelocity = {
        x:
          Math.cos(angle) * this.wanderVelocity.x -
          Math.sin(angle) * this.wanderVelocity.y,
        y:
          Math.sin(angle) * this.wanderVelocity.x +
          Math.cos(angle) * this.wanderVelocity.y,
      }
    }

    // rotate(Random.rangeFloat(-wanderConstantVariation, wanderConstantVariation))

    // Mirror velocity on an axis and apply slight angle variation
    const mirrorOn = (axis) => {
      this.wanderVelocity[axis] = -this.wanderVelocity[axis]

      rotate(Random.rangeFloat(-wanderMirrorVariation, wanderMirrorVariation))
    }

    const cameraCenter = {
      x: -(Camera.translation.x - window.innerWidth / 2),
      y: -(Camera.translation.y - window.innerHeight / 2),
    }

    if (cameraCenter.x - window.innerWidth / 2 + wanderSlack < Map.lowestX)
      mirrorOn('x')
    else if (
      cameraCenter.x + window.innerWidth / 2 - wanderSlack >
      Map.highestX
    )
      mirrorOn('x')

    if (cameraCenter.y - window.innerHeight / 2 + wanderSlack < Map.lowestY)
      mirrorOn('y')
    else if (
      cameraCenter.y + window.innerHeight / 2 - wanderSlack >
      Map.highestY
    )
      mirrorOn('y')
  }

  // Inicia as funcoes da Camera
  static setup(context) {
    this.#context = context

    // Desloca a visao para a origem
    // this.reset()

    // Sempre que usuario arrastar com botao direito, desloque a camera
    IO.addEventListener('mouserightdrag', this.translate)

    IO.addEventListener('rightclick', () => {
      Map.setCursor('move')
      // document.body.className = 'move'
    })
    IO.addEventListener('rightup', () => Map.removeCursor('move'))

    // Sempre que a tela mudar de tamanho, corrige o translation
    window.addEventListener('resize', () => {
      Camera.translation = Camera.translation
    })

    Map.addEventListener('newframe', () => this.update())
  }

  // Move a camera
  static translate({ x, y }) {
    Camera.translation = {
      x: Camera.translation.x + x,
      y: Camera.translation.y + y,
    }
  }

  // Centraliza a camera na origem
  static reset() {
    // Coloca o deslocamento no centro
    Camera.translation = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  }

  // Translate coordenadas relativas a screen para map
  static ScreenToMap(x, y) {
    return { x: x - Camera.translation.x, y: y - Camera.translation.y }
  }

  // Translate coordenadas relativas a map para screen
  static MapToScreen(x, y) {
    return { x: x + Camera.translation.x, y: y + Camera.translation.y }
  }

  // Define o novo destino para deslocar a camera
  static center({ x, y }) {
    this.panDestination.x = x
    this.panDestination.y = y
  }

  // Se ha um destino, se desloca ate ele
  static pan() {
    if (this.panDestination.x == null) return

    const { cameraPanSpeed } = Configuration.getInstance().general

    // Descobre se ja esta perto o suficiente
    if (getDistance(this.position, this.panDestination) <= cameraPanSpeed) {
      this.position = this.panDestination
      this.panDestination = { x: null, y: null }

      return
    }

    // Descobre o angulo que vai se deslocar
    const angle = angleBetween(this.position, this.panDestination)

    // Desloca
    this.position = {
      x: this.position.x + cameraPanSpeed * cos(angle),
      y: this.position.y + cameraPanSpeed * -sin(angle),
    }
  }
}
