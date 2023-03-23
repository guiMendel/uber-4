import { getDistance, getSquaredDistance } from '../../helpers/vectorDistance'
import IO from '../IO'
import Configuration from '../../configuration/Configuration'
import Camera from '../Camera'

// Classe que define uma entidade capaz de ser desenhada em tela
export default class Drawable {
  static className = 'Drawable'

  // Um objeto que vai guardar referencia para todas as instancias de drawable
  // A chave eh uma string com o nome de uma subclasse de drawable (como Edge, etc), os valores sao outro objeto
  // Esse outro objeto tem como chave o id de cada instancia, e aponta para a instancia correspondente
  static drawableInstances = {}

  // Quais animacoes estao sendo executadas neste drawable
  animations = []

  // Callbacks para executar no momento da destruicao deste objeto
  onDestroy = []

  static createOrGet(id, ...rawProperties) {
    const properties = this.nameProperties(...rawProperties)

    // Verifica se ja exist euma instancia com o id fornecido
    if (id && this.instances[id] != undefined) {
      const existingDrawable = this.instances[id]

      // Compara a instancia existente com as propriedades fornecidas
      const result = existingDrawable.compareTo(properties)

      if (result === true) return existingDrawable

      throw new Error(
        `Attempt to insert new instance of "${
          this.className
        }" with repeated id, but the field "${result}" differs.\nPrevious value: ${JSON.stringify(
          existingDrawable[result]
        )}. New value: ${JSON.stringify(properties[result])}`
      )
    }

    return new this(id, ...rawProperties)
  }

  constructor(id, properties) {
    // Keep the properties
    this.id = id ?? Drawable.generateId(this)
    Object.assign(this, properties)

    // Registrar drawable
    this.constructor.instances[this.id] = this
  }

  // Retorna o objeto que armazena todas as instancias da classe de this
  static get instances() {
    if (Drawable.drawableInstances[this.className] == undefined)
      Drawable.drawableInstances[this.className] = {}

    return Drawable.drawableInstances[this.className]
  }

  // Permite saber a distancia do cursor ate este drawable
  get distanceFromMouse() {
    // Deve possuir coordenadas x e y
    if (this.x == undefined || this.y == undefined)
      throw new Error(
        `Impossible to determine distance between cursor and Drawable class "${this.constructor.className}", that has no x & y coordinates`
      )

    return getDistance(this, IO.mouse.mapCoords)
  }

  #sounds = {}

  registerSound(sound, baseVolume) {
    this.#sounds[sound] = { sound: new Audio(sound), baseVolume }
    this.#sounds[sound].sound.volume = baseVolume

    return this.#sounds[sound].sound
  }

  // Plays a sound
  playSound(soundPath) {
    const { sound } = this.#sounds[soundPath]

    if (sound == null) throw new Error('No sound ' + soundPath)

    sound.pause()
    sound.currentTime = 0
    sound.play()
  }

  // Permite alterar o valor de uma propriedade do drawable ao longo de multiplos frames, dada uma condicao
  animate({
    property,
    min,
    max,
    condition,
    speed = Configuration.getInstance().theme.generalAnimationSpeed,
  }) {
    // Descobre o quato alterar a cada frame
    const frameAlteration =
      (max - min) /
      speed /
      Configuration.getInstance().general.maxFramesPerSecond

    this.animations.push(() => {
      if (condition()) {
        // Soma o alteration
        if (this[property] != max)
          this[property] = Math.min(max, this[property] + frameAlteration)
      } else {
        // Subtrai o alteration
        if (this[property] != min)
          this[property] = Math.max(min, this[property] - frameAlteration)
      }
    })
  }

  // Compara this com o objeto fornecido, e retorna true se todas suas propriedades coincidirem
  // Se alguma for diferente, retorna o seu nome
  compareTo(otherObject) {
    for (const property in otherObject) {
      if (property != 'id' && this[property] != otherObject[property])
        return property
    }

    return true
  }

  // Abstract
  // Permite desenhar na tela
  draw(drawer) {
    throw new Error('This method must be implemented by a child class')
  }

  // Permite agir dentro da simulacao
  simulationStep() {
    if (this.x != undefined && this.y != undefined) {
      const distance = getDistance(this, Camera.position)

      const inverseLerp = (value, min, max) =>
        (Math.min(Math.max(value, min), max) - min) / (max - min)

      for (const { sound, baseVolume } of Object.values(this.#sounds)) {
        sound.volume =
          baseVolume * ((1 - inverseLerp(distance, 0, 500)) * 0.8 + 0.2)
      }
    }
  }

  destroy() {
    // Limpa as referencias deste objeto
    this.onDestroy.forEach((callback) => callback())

    // Remove a referencia principal
    delete Drawable.drawableInstances[this.constructor.className][this.id]

    // Destroi as propriedades
    Object.keys(this).forEach((property) => delete this[property])
  }

  // Permite observar eventos
  static addEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `The ${this.className} class doesn't provide an eventListener of type "${type}"`
      )

    this.listeners[type].push(callback)
  }

  // Permite levantar eventos
  static raiseEvent(type, payload) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `Tentativa em ${this.className} de levantar evento de tipo inexistente "${type}"`
      )

    for (const listener of this.listeners[type]) listener(payload)
  }

  // Permite observar eventos
  static removeEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `The ${this.className} class doesn't provide an eventListener of type "${type}"`
      )

    const index = this.listeners[type].indexOf(callback)

    if (index == -1) return

    this.listeners[type].splice(index, 1)
  }

  // Gera um id valido para uma nova instancia desta clase
  static generateId(callingInstance) {
    const callingClass = callingInstance?.constructor ?? this

    let newId

    const instanceArray = Drawable.drawableInstances[callingClass.className]

    do {
      newId = Math.round(Math.random() * 99999)
    } while (instanceArray && instanceArray[newId] != undefined)

    return newId
  }

  static resetAll() {
    this.drawableInstances = {}
  }
}
