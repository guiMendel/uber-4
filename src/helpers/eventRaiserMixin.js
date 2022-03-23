// Define um mixin que permite um objecto levantar eventos
export default {
  // Listeners
  listeners: {},

  // Permite declarar quais eventos essa classe levanta
  declareEventTypes(...types) {
    for (const type of types) this.listeners[type] = {}
  },

  // Permite observar eventos
  addEventListener(type, id, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `A classe ${this.constructor.name} nao fornece um eventListener do tipo "${type}"`
      )

    if (id == undefined)
      throw new Error('Por favor, forneca um id para o listener')

    if (this.listeners[type][id])
      throw new Error(
        `O evento de tipo ${type}, da classe ${this.constructor.name}, ja possui um listener com o id ${id}`
      )

    this.listeners[type][id] = callback
  },

  // Permite parar de observar eventos
  removeEventListener(type, id) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `A classe ${this.constructor.name} nao fornece um eventListener do tipo "${type}"`
      )

    if (id == undefined)
      throw new Error('Por favor, forneca um id para o listener')

    delete this.listeners[type][id]
  },

  // Permite levantar eventos
  raiseEvent(type, payload) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `Tentativa na classe ${this.constructor.name} de levantar evento de tipo não declarado "${type}"`
      )

    for (const listener of Object.values(this.listeners[type]))
      listener(payload)
  },
}
