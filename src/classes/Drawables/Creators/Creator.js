import IO from '../../IO'
import Map from '../../Map'
import Drawable from '../Drawable'

// Define um tipo especial de drawable: um singleton que permite criar novos elementos no mapa
export default class Creator extends Drawable {
  // Sera verdadeiro uma vez que a instancia for inicializada
  #isInitialized = false

  constructor() {
    super(1, {})

    // So inicializa uma vez
    if (this.#isInitialized) return

    this.#isInitialized = true

    // Para de criar no cancel
    IO.addEventListener('cancel', () => {
      this.constructor.isActive = false
    })

    // Pega o nome do botao de acordo com o nome da classe
    const nameEnd = this.constructor.name.indexOf('Creator')

    const buttonName = `new-${this.constructor.name
      .slice(0, nameEnd)
      .toLowerCase()}`

    IO.buttons[buttonName].onTrigger(() => {
      this.constructor.isActive = true
    })

    // Mantem o cursor atualizado
    Map.addEventListener('activateinteractionclass', ({ value, oldValue }) => {
      if (value == this.constructor) Map.setCursor('pencil')
      else if (oldValue == this.constructor) this.cancel()
    })

    // Ouve cliques
    IO.addEventListener('leftclick', (value) => this.handleClick(value))
  }

  cancel() {
    Map.removeCursor('pencil')

    if (this.onCancel != null) this.onCancel()
  }

  // Abstract
  handleClick(position) {
    throw new Error(
      'O metodo "handleClick" deve ser implementado por uma classe filho'
    )
  }

  // Retorna a instancia do singleton
  static getInstance() {
    const instancesArray = Drawable.drawableInstances[this.name]

    return instancesArray && instancesArray[0]
  }

  static get isActive() {
    return Map.activeInteractionClass == this
  }

  static set isActive(value) {
    if (value) Map.activeInteractionClass = this
    else if (this.isActive) Map.activeInteractionClass = null
  }
}
