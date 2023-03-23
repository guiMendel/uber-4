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
        `The ${this.constructor.name} class doesn't provide an eventListener of type "${type}"`
      )

    if (id == undefined)
      throw new Error('Please, provide the listener with an id')

    if (this.listeners[type][id])
      throw new Error(
        `Event of type ${type}, from class ${this.constructor.name}, already possesses a listener with id ${id}`
      )

    this.listeners[type][id] = callback
  },

  // Permite parar de observar eventos
  removeEventListener(type, id) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `The ${this.name} class doesn't provide an eventListener of type "${type}"`
      )

    if (id == undefined)
      throw new Error('Please, provide an id to the listener')

    delete this.listeners[type][id]
  },

  // Permite levantar eventos
  raiseEvent(type, payload) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `Attempt inside class ${this.constructor.name} of raising event with an undeclared type "${type}"`
      )

    for (const listener of Object.values(this.listeners[type]))
      listener(payload)
  },
}
