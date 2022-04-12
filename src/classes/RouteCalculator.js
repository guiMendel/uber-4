import IO from './IO'
import getBestRoutesFor from '../modules/getBestRoutesFor'
import Client from './Drawables/Client'
import { getDistance } from '../helpers/vectorDistance'
import appConfig from '../configuration/appConfig'
import Car from './Drawables/Car'
import assignRoutes from '../modules/assignRoutes'

const { clientWalkSpeed, pixelsPerKilometer } = appConfig

// Fornece a classe responsavel por saber quando e como calcular as rotas dos clientes, e o que fazer depois
export default class RouteCalculator {
  // Listeners
  static listeners = { calculateroutes: [] }

  static setup() {
    // Observa a selecao do botao de calcular rota
    IO.addButtonListener('select-route', () => this.calculate(Client.selected))
  }

  // Faz o caluclo das melhores rotas para o cliente fornecido
  static async calculate(client, noRaise = false) {
    if (client == null) return

    // Encontra o tempo para ir andando ate o objetivo
    const walkTime =
      getDistance(client, client.destination) /
      pixelsPerKilometer /
      clientWalkSpeed

    // Descarta as rotas mais lentas que o tempo de caminhada
    const bestRoutes = await getBestRoutesFor(client).then((bestNodes) =>
      bestNodes.filter((route) => route.totalCost <= walkTime)
    )

    // Levanta evento com as rotas calculadas
    if (noRaise == false)
      RouteCalculator.#raiseEvent('calculateroutes', {
        routes: bestRoutes,
        client,
      })

    return bestRoutes
  }

  // Calcula rotas para todos os clientes que ainda nao tem
  static async calculateForRemainingClients() {
    // Pega todos os clientes sem rota
    const routelessClients = Object.values(Client.instances).filter(
      (client) => client.selectedRoute == null
    )

    // Verifica se tem algum
    if (routelessClients.length == 0) return

    // Armazenara as rotas, catalogadas pelo recurso
    const routes = { client: {}, car: {} }

    // Armazena as promessas de encontrar rotas para cada cliente
    const promiseArray = []

    // Encontra as melhores rotas para cada cliente
    for (const client of routelessClients) {
      promiseArray.push(
        this.calculate(client, true).then((routes) => ({ client, routes }))
      )
    }

    // Para cada conjunto de rotas de cliente
    for (const { client, routes: clientRoutes } of await Promise.all(
      promiseArray
    )) {
      // Se nao obteve rotas para este cliente, bota ele pra andar
      if (clientRoutes.length == 0) {
        client.selectedRoute = 'walk'

        // Remove do array de clientes
        const clientIndex = routelessClients.indexOf(client)
        routelessClients.splice(clientIndex, 1)

        continue
      }

      // Adiciona esta rota
      routes.client[client.id] = clientRoutes

      // Categorizada como carro tambem
      for (const route of clientRoutes) {
        const { car } = route.stepper

        if (routes.car[car.id] == undefined) routes.car[car.id] = [route]
        else routes.car[car.id].push(route)
      }
    }

    // Da as rotas encontradas na mao de quem sabe oq fazer
    assignRoutes(routes)

    // Recomeca, ate que nao tenham mais clientes sem rota
    this.calculateForRemainingClients()
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
