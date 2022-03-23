import { getDistance } from '../../helpers/vectorDistance'
import IO from '../IO'
import theme from '../../configuration/theme'
import appConfig from '../../configuration/appConfig'

const { generalAnimationSpeed } = theme
const { maxFramesPerSecond } = appConfig

// Classe que define uma entidade capaz de ser desenhada em tela
export default class Drawable {
  // Um objeto que vai guardar referencia para todas as instancias de drawable
  // A chave eh uma string com o nome de uma subclasse de drawable (como Edge, etc), os valores sao outro objeto
  // Esse outro objeto tem como chave o id de cada instancia, e aponta para a instancia correspondente
  static drawableInstances = {}

  // Quais animacoes estao sendo executadas neste drawable
  animations = []

  constructor(id, properties) {
    // Verifica se ja exist euma instancia com o id fornecido
    if (this.instances[id] != undefined) {
      const existingDrawable = this.instances[id]

      // Compara a instancia existente com as propriedades fornecidas
      const result = existingDrawable.compareTo(properties)

      if (result === true) return existingDrawable

      throw new Error(
        `Tentativa de inserir nova instancia de "${this.constructor.name}" com id repetido, mas o campo "${result}" difere.\nValor preexistente: ${existingDrawable[result]}. Valor novo ${properties[result]}`
      )
    }

    // Keep the properties
    this.id = id
    Object.assign(this, properties)

    // Registrar drawable
    this.instances[id] = this
  }

  // Retorna o objeto que armazena todas as instancias da classe de this
  get instances() {
    if (Drawable.drawableInstances[this.constructor.name] == undefined)
      Drawable.drawableInstances[this.constructor.name] = {}

    return Drawable.drawableInstances[this.constructor.name]
  }

  // Permite saber a distancia do cursor ate este drawable
  get distanceFromMouse() {
    // Deve possuir coordenadas x e y
    if (this.x == undefined || this.y == undefined)
      throw new Error(
        `Impossivel determinar distancia do cursor para Drawable de classe "${this.constructor.name}", que nao possui coordenadas x e y`
      )

    return getDistance(this, IO.mouse.mapCoords)
  }

  // Permite alterar o valor de uma propriedade do drawable ao longo de multiplos frames, dada uma condicao
  animate({ property, min, max, condition, speed = generalAnimationSpeed }) {
    // Descobre o quato alterar a cada frame
    const frameAlteration = (max - min) / speed / maxFramesPerSecond

    this.animations.push(() => {
      if (condition()) {
        // Soma o alteration
        this[property] = Math.min(max, this[property] + frameAlteration)
      } else {
        // Subtrai o alteration
        this[property] = Math.max(min, this[property] - frameAlteration)
      }
    })
  }

  // Compara this com o objeto fornecido, e retorna true se todas suas propriedades coincidirem
  // Se alguma for diferente, retorna o seu nome
  compareTo(otherObject) {
    for (const property in this) {
      if (property != 'id' && this[property] != otherObject[property])
        return property
    }

    return true
  }

  // Abstract
  // Permite desenhar na tela
  draw(drawer) {
    throw new Error('Este método deve ser implementado por uma classe filho')
  }

  // Permite observar eventos
  static addEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `A classe IO nao fornece um eventListener do tipo "${type}"`
      )

    this.listeners[type].push(callback)
  }

  // Permite levantar eventos
  static raiseEvent(type, payload) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `Tentativa em IO de levantar evento de tipo inexistente "${type}"`
      )

    for (const listener of this.listeners[type]) listener(payload)
  }
}
