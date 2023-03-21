// Este modulo atribui as rotas fornecidas entre clientes e carros da maneira mais otima

import Heap from '../../classes/DataStructures/Heap'

// Recebe as rotas categorizadas entre clientes e carros
export default function assignRoutes(categorizedRoutes) {
  const { client, car } = categorizedRoutes

  // Memoriza se tem menos carros ou clientes
  // Daqui pra frente sera mencionado apenas como "recurso"
  let scarcestResource =
    Object.keys(client).length <= Object.keys(car).length ? 'client' : 'car'

  const routes = categorizedRoutes[scarcestResource]

  // Guarda informacoes sobre o contexto
  const config = {
    resource: scarcestResource,
    minCost: 1,
    secondResource: scarcestResource == 'client' ? 'car' : 'client',
  }

  // Gera o conjunto com as rotas ordenadas
  const wrappedRoutes = new Heap((w1, w2) => w1.cost < w2.cost)

  // Adiciona todas as rotas
  addRoutes(routes, wrappedRoutes, config)

  if (wrappedRoutes.length == 0) return

  // Atualiza o config
  config.minCost = wrappedRoutes.peek().route.totalCost

  // Encontra o melhor assignment
  const bestAssignment = findBestAssignment(wrappedRoutes)

  // Efetiva as atribuicoes
  const appliedClients = {}
  const appliedCars = {}

  const applyAssignment = (assignment) => {
    if (assignment == null) return

    const { car, client } = assignment.route.stepper

    // Por seguranca
    if (appliedCars[car.id] || appliedClients[client.id]) {
      applyAssignment(assignment.parent)
      return
    }

    appliedCars[car.id] = true
    appliedClients[client.id] = true

    client.selectedRoute = assignment.route

    applyAssignment(assignment.parent)
  }

  applyAssignment(bestAssignment)
}

function findBestAssignment(wrappedRoutes) {
  // Executa indefinidamente
  while (true) {
    // Retira a proxima atribuicao menos custosa
    const assignment = wrappedRoutes.pop()

    // Previne um erro
    if (assignment == undefined)
      throw new Error(
        'Failed to find best assignment of encountered routes: possible assignments vanished unexpectedly'
      )

    // Se nao tem mais rotas para atribuir a partir desta, encontramos a melhor atribuicao
    if (Object.keys(assignment.remainingRoutes).length == 0) return assignment

    // Caso tenha, adiciona essas rotas
    // Se esta funcao retornar falso, eh pq as rotas que ainda tinha eram todas invalidas, e por isso encontramos a melhor atribuicao
    if (
      addRoutes(
        assignment.remainingRoutes,
        wrappedRoutes,
        assignment.config,
        assignment
      ) == false
    )
      return assignment
  }
}

function addRoutes(routes, wrappedRoutes, config, parent = null) {
  for (const routeSetId in routes) {
    const routeSet = routes[routeSetId]
    for (const routeId in routeSet) {
      const route = routeSet[routeId]

      if (route == undefined) {
        delete routeSet[routeId]
        continue
      }

      // Se tiver um pai, filtra as rotas cujo segundo recurso eh igual ao do pai (o primeiro ja vem filtrado)

      if (parent != null) {
        if (
          route.stepper[config.secondResource].id ==
          parent.route.stepper[config.secondResource].id
        ) {
          delete routeSet[routeId]
          continue
        }
      }

      wrappedRoutes.insert(new RouteAssignment(route, parent, routes, config))
    }

    // Se apos processar todas as rotas deste recurso, ele ficou vazio, retira ele
    if (Object.keys(routeSet).length == 0) delete routes[routeSetId]
  }

  // Ao final, se nao sobraram rotas, retorna falso
  if (Object.keys(routes).length == 0) {
    return false
  }
  return true
}

// Guarda um conjunto de rotas recursivamente, e informacoes sobre as rotas que ainda nao foram adicionadas
// Para uso no algoritmo A* de atribuicao de rotas/clientes
class RouteAssignment {
  constructor(route, parent, remainingRoutes, config) {
    if (route == null) throw new Error('Null route!')

    const { resource } = config

    this.route = route
    this.parent = parent
    this.config = config

    this.g = (parent ? parent.g : 0) + this.route.totalCost

    // Remove o recurso desta rota das rotas restantes
    this.remainingRoutes = {}
    for (const resourceId in remainingRoutes) {
      if (route.stepper[resource].id != resourceId)
        this.remainingRoutes[resourceId] = [...remainingRoutes[resourceId]]
    }
  }

  get cost() {
    // A heuristica eh o custo menor possivel de uma rota * quantas rotas faltam
    const h = Object.keys(this.remainingRoutes).length * this.config.minCost

    return this.g + h
  }
}
