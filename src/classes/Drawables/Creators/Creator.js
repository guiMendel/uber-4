import IO from '../../IO'
import Map from '../../Map'
import Drawable from '../Drawable'

// Define um tipo especial de drawable: um singleton que permite criar novos elementos no mapa
export default class Creator extends Drawable {
  reset() {
    this.resetter()
  }

  // Sera verdadeiro uma vez que a instancia for inicializada
  #isInitialized = false

  resetter = null

  constructor() {
    super(1, {})

    // So inicializa uma vez
    if (this.#isInitialized) return

    this.#isInitialized = true

    // Para de criar no cancel
    const cancelCallback = () => {
      this.constructor.isActive = false
    }
    IO.addEventListener('cancel', cancelCallback)

    // Pega o nome do botao de acordo com o nome da classe
    const nameEnd = this.constructor.name.indexOf('Creator')

    const buttonName = `new-${this.constructor.name
      .slice(0, nameEnd)
      .toLowerCase()}`

    const buttonCallback = () => {
      this.constructor.isActive = true
    }
    IO.addButtonListener(buttonName, buttonCallback)

    // Mantem o cursor atualizado
    const cursorCallback = ({ value, oldValue }) => {
      if (value == this.constructor) Map.setCursor('pencil')
      else if (oldValue == this.constructor) this.cancel()
    }
    Map.addEventListener('activateinteractionclass', cursorCallback)

    // Ouve cliques
    const clickCallback = (value) => {
      if (this.constructor.isActive) this.handleClick(value)
    }
    IO.addEventListener('leftclick', clickCallback)

    this.resetter = () => {
      IO.removeEventListener('cancel', cancelCallback)
      IO.removeButtonListener(buttonName, buttonCallback)
      Map.removeEventListener('activateinteractionclass', cursorCallback)
      IO.removeEventListener('leftclick', clickCallback)
    }
  }

  cancel() {
    Map.removeCursor('pencil')

    if (this.onCancel != null) this.onCancel()
  }

  draw(drawer) {
    if (!this.constructor.isActive) return

    this.onDraw(drawer)
  }

  // Abstract
  handleClick(position) {
    throw new Error(
      'The "handleClick" method must be implemented by a child class'
    )
  }

  onDraw(position) {
    throw new Error('The "onDraw" method must be implemented by a child class')
  }

  // Retorna a instancia do singleton
  static getInstance() {
    const instancesArray = Drawable.drawableInstances[this.name]

    return instancesArray && Object.values(instancesArray)[0]
  }

  static get isActive() {
    return Map.activeInteractionClass == this
  }

  static set isActive(value) {
    if (value) Map.activeInteractionClass = this
    else if (this.isActive) Map.activeInteractionClass = null
  }
}
