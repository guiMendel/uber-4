import IO from './IO'
import getBestRoutesFor from '../modules/getBestRoutesFor'
import Client from './Drawables/Client'
import { getDistance } from '../helpers/vectorDistance'
import appConfig from '../configuration/appConfig'

const { clientWalkSpeed, pixelsPerKilometer } = appConfig

// Fornece a classe responsavel por saber quando e como calcular as rotas dos clientes, e o que fazer depois
export default class RouteCalculator {
  // Listeners
  static listeners = { calculateroutes: [] }

  static setup() {
    // Observa a selecao do botao de calcular rota
    IO.addButtonListener('select-route', this.calculate)
  }

  // Faz o caluclo das melhores rotas para o cliente selecionado, e destaca elas em tela
  static calculate() {
    if (Client.selected == null) return

    const client = Client.selected

    // Encontra o tempo para ir andando ate o objetivo
    const walkTime =
      getDistance(client, client.destination) /
      pixelsPerKilometer /
      clientWalkSpeed

    // Levanta evento com as rotas calculadas
    getBestRoutesFor(client).then((bestNodes) =>
      RouteCalculator.#raiseEvent('calculateroutes', {
        // Descarta as rotas mais lentas que o tempo de caminhada
        routes: bestNodes.filter((route) => route.totalCost <= walkTime),
        client,
      })
    )
  }

  // Permite observar eventos
  static addEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `A classe IO nao fornece um eventListener do tipo "${type}"`
      )

    this.listeners[type].push(callback)
  }

  // Permite observar eventos
  static removeEventListener(type, callback) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `A classe ${this.name} nao fornece um eventListener do tipo "${type}"`
      )

    const index = this.listeners[type].indexOf(callback)

    if (index == -1) return

    this.listeners[type].splice(index, 1)
  }

  // Permite levantar eventos
  static #raiseEvent(type, payload) {
    if (this.listeners[type] == undefined)
      throw new Error(
        `Tentativa em IO de levantar evento de tipo inexistente "${type}"`
      )

    for (const listener of this.listeners[type]) listener(payload)
  }
}
