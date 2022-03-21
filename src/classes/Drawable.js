import appConfig from '../configuration/appConfig'
import theme from '../configuration/theme'

const { drawOrder } = appConfig
const { mapBackground } = theme

// Classe que define uma entidade capaz de ser desenhada em tela
export default class Drawable {
  // Um objeto que vai guardar referencia para todas as instancias de drawable
  // A chave eh uma string com o nome de uma subclasse de drawable (como Edge, etc), os valores sao outro objeto
  // Esse outro objeto tem como chave o id de cada instancia, e aponta para a instancia correspondente
  static drawableInstances = {}

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

  // Compara this com o objeto fornecido, e retorna true se todas suas propriedades coincidirem
  // Se alguma for diferente, retorna o seu nome
  compareTo(otherObject) {
    for (const property in this) {
      if (property != 'id' && this[property] != otherObject[property])
        return property
    }

    return true
  }

  // Desenha o frame atual da tela
  static drawScreen(context) {
    // Limpa desenhos e carrega background
    context.fillStyle = mapBackground
    context.fillRect(0, 0, window.innerWidth, window.innerHeight)

    // Renderiza as instancias em ordem
    for (const drawableClassName of drawOrder) {
      if (Drawable.drawableInstances[drawableClassName] == undefined) continue

      // Desenha cada instancia desta classe
      for (const instance of Object.values(
        Drawable.drawableInstances[drawableClassName]
      )) {
        instance.draw(context)
      }
    }
  }

  // Abstract
  // Permite desenhar na tela
  draw(context) {
    throw new Error('Este método deve ser implementado por uma classe filho')
  }
}
