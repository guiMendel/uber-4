import Heap from '../classes/DataStructures/Heap'
import Car from '../classes/Drawables/Car'
import Debug from '../classes/Drawables/Debug'
import Drawable from '../classes/Drawables/Drawable'
import appConfig from '../configuration/appConfig'
import { displacePoint, getDistance } from '../helpers/vectorDistance'

// Este modulo fornece um metodo que, dado um cliente, descobre para qual coordenada ele deve se deslocar, e quais o melhores carros que podem lhe buscar nesta coordenada e lhe deixar e seu destino final

// Algoritmo geral:
// 1. Selecionar um cliente
// 2. Usando uma heuristica, selecionar um subconjunto de carros para analisar
// 3. Ao longo de N iteracoes:
//    1. Para cada carro (se possivel, assincronamente), realizar um passo do algoritmo A* modificado
//    2. Para cada carro que encontrou um novo melhor node, aumentar um pouco o valor de N, para continuar iterando
// 4. Pegar os K melhores nodes encontrados de cada carro, e calcular o tempo que leva deste node ate o destino do cliente (usando cache dos resultados)
// 5. Para cada carro, criar um ranking com os nodes que tem o menor custo total (contando o tempo calculado no passo 4) e fornecer eles como resultado

// Algoritmo A* modificado:
// Cada noh possui a aresta correspondente, um g (custo para chegar no source desta aresta), um h (tempos do carro (saindo de source) e do cliente para o rdv), um time (tempo para percorrer a aresta completa) e qual seu noh pai

// 1. Lista de nos: openNodes. Inicia com o no inicial, contruido com aresta inicial do carro, time = tempo para finalizar a aresta, g = 0 e h calculado de forma excepcional, consdierando-se a posicao atual do carro
// 2. Pega e remove o proximo no de openNodes que tem o menor custo total, node, seu g, seu h e seu time
//    -> O h eh calculado quando eh lido pela primeira vez. Como para o mesmo cliente e aresta o h nao varia, armazenamos este valor para futuras consultas (exceto para o startingNode, cujo calculo eh diferenciado). O h retorna 2 valores: h.car, tempo para saindo de source o carro chegar no rdv; e h.client, tempo para cliente andar ate o rdv.
//    -> Custo total eh max(g + h.car, h.client)
// 3. Para cada vizinho de node, calcular tentativeG = g + time. Se forem maiores que o atual g deste vizinho (ou se ele ainda nao tiver g), coloca node como seu novo pai e atualiza seu g. Adicionar este vizinho a openNodes, e atualizar sua posicao na lista de melhores nos, ordenada por custo total
// 4. Se openNodes nao estiver vazio, retorne para o passo 2.

const {
  pathExpansionIterations,
  newBestPathReward,
  pixelsPerKilometer,
  clientWalkSpeed,
  countOfNodesToConsider,
} = appConfig

// Helper para criar um Heap de nodes
const newNodeHeap = () =>
  new Heap((nodeA, nodeB) => nodeA.totalCost < nodeB.totalCost)

// Encontra as rotas mais rapidas par aque um cliente chegue em seu destino, e com quais carros
export default async function getBestRoutesFor(client) {
  // Inicializa um cache para armazenar os valores calculados de h
  // A chave sera o id da aresta, o valor sera o objeto resultado de executar h com essa aresta
  const hCache = {}

  // Contara as iteracoes totais. Ja coloca o valor inicial
  let totalIterations = pathExpansionIterations

  // Invoca as funcoes nesta lista ao comeco de cada iteracao
  const iterationCallbacks = []

  // Steppers para cada carro
  const steppers = getSubsetOfCarsFor(client).map((car) => {
    const stepper = new AStarStepper(client, car, hCache, iterationCallbacks)

    // Sempre que o stepper arrumar um novo best, aumenta o nmr de iteracoes
    stepper.onNewBest(() => (totalIterations += newBestPathReward))

    return stepper
  })

  // Inicia as iteracoes de A*
  for (let iteration = 0; iteration < totalIterations; iteration++) {
    // for (const c of iterationCallbacks) c()

    // Da um step em cada stepper
    const iterationResult = await Promise.all(
      steppers.map((stepper) => stepper.step())
    )

    // Se todos steppers terminaram, finalize as iteracoes
    if (iterationResult.every((result) => result == true)) {
      console.log(`Todos steppers finalizaram em ${iteration + 1} iteracoes`)
      break
    }
  }

  // Coleta os melhores resultados finais
  const bestStepeprNodes = newNodeHeap()

  // Passa por cada stepper e coletas seus melhores nodes
  for (const stepper of steppers) {
    // Pega os N melhores nodes deste stepper
    for (let i = 0; i < countOfNodesToConsider; i++) {
      const node = stepper.closedNodes.pop()

      if (node == undefined) break

      bestStepeprNodes.insert(node)
    }
  }

  // Monta um vetor com os N melhores nodes totais
  const bestNodes = []

  for (let i = 0; i < countOfNodesToConsider; i++) {
    const node = bestStepeprNodes.pop()

    console.log(node)

    if (node == undefined) break

    bestNodes.push(node)
  }

  for (const c of iterationCallbacks) c()

  return bestNodes
}

// Gera uma estrutura que, dado um carro e um cache de h, armazena os nos descobertos e fornece uma interface para realizar os passos do A* modificado
class AStarStepper {
  // Listeners the quando houver um novo best path
  #newBestListeners = []

  // OpenNodes e closedNodes sao heaps, que da prioridade para nos com menor custo total
  openNodes = newNodeHeap()

  closedNodes = newNodeHeap()

  // Aqui nos guardamos a relacao edge/node
  // A chave vai ser o id da edge, o vlaor vai ser o node
  edgeToNode = {}

  constructor(client, car, hCache, iterationCallbacks) {
    // Armazena o carro & cliente
    this.car = car
    this.client = client
    this.hCache = hCache
    this.iterationCallbacks = iterationCallbacks

    // Inicializa o primeiro no
    this.#registerNodeFor(car.edge, null, car)

    // Levanta evento de new best sempre que o closed nodes tiver um novo highest priority
    this.closedNodes.onNewHighestPriority(() => {
      for (const listener of this.#newBestListeners) listener()
    })
  }

  // Realiza a expansao do proximo openNode
  // Retorna true se ja finalizou o A*
  async step() {
    // Se nao tem mais openNodes, nao ha o que fazer
    if (this.openNodes.length == 0) return true

    // Pega o proximo openNode
    const node = this.openNodes.pop()

    // Garante consistencia
    if (node.closed)
      throw new Error(
        'Erro no A*: Por alguma razao, o no a ser expandido ja havia sido expandido antes'
      )

    this.closedNodes.insert(node)

    // Para cada aresta descoberta a partir da expansao deste node
    for (const edge of node.expand()) {
      // Registra a aresta
      this.#registerNodeFor(edge, node)
    }
  }

  onNewBest(listener) {
    this.#newBestListeners.push(listener)
  }

  // Dado a aresta e um potencial node pai, verifica se colcoar o node desta aresta como filho deste pai sera vantajoso
  #registerNodeFor(edge, parentNode, car) {
    // Se recebeu um car, eh o node inicial: cria um no com h excepcional
    if (car != undefined) {
      const node = new Node(null, edge, this, car, this.iterationCallbacks)

      this.openNodes.insert(node)
      this.edgeToNode[edge.id] = node

      return
    }

    // Verifica se ja ha um node para essa edge
    const existingNode = this.edgeToNode[edge.id]

    if (existingNode != undefined) {
      // Se este no esta fechado, ignora
      if (existingNode.closed) return

      // Faz este no considerar se o novo pai seria mais rapido
      existingNode.considerNewParent(parentNode)

      return
    }

    // Se nao havia um node, criar
    const node = new Node(parentNode, edge, this, null, this.iterationCallbacks)

    this.openNodes.insert(node)
    this.edgeToNode[edge.id] = node
  }
}

// Define cada no do A*
class Node {
  // Guarda as linhas de debug que esta desenhando
  debugLines = []

  // Se este node ja foi expandido
  closed = false

  // Este campo aramazenara o valor de h se ele for excepcional para este node
  #exceptionalH = undefined

  constructor(parent, edge, stepper, car, iterationCallbacks) {
    this.stepper = stepper
    this.edge = edge
    this.parent = parent

    // A partir do pai, descobre o seu g
    this.g = parent == null ? 0 : parent.g + parent.time

    // Se recebemos o carro, calculamos um valor de h e time excepcional
    if (car != null) {
      this.time = getDistance(car, edge.destination) / edge.mapSpeed
      this.calculateExceptionalH(car)
    } else {
      // A partir da edge, descobre seu time
      this.time = edge.mapDistance / edge.mapSpeed
    }

    iterationCallbacks.push(() => {
      this.debugLines.forEach((line) => line())
      this.debugLines = []
    })
  }

  // Retorna o valor de h sobre esse no. Consulta o hCache, mas se n tiver registro, realiza o calculo e registra
  get h() {
    // Se houver um valor excepcional de h para este no, usamos ele
    if (this.#exceptionalH != undefined) return this.#exceptionalH

    if (this.stepper.hCache[this.edge.id] != undefined)
      return this.stepper.hCache[this.edge.id]

    // Se nao, calcula
    const distances = this.edge.getDistances(
      this.stepper.client.x,
      this.stepper.client.y
    )

    // Calcula a distancia minima do cliente ate a aresta
    const clientDistance = Math.sqrt(
      distances.sourceSquared - Math.pow(distances.projection, 2)
    )

    const h = {
      // A distancia em pixels eh calculada em km, e em seguida divididmos pela velocidade de andar do cliente para achar o tempo em horas
      client: clientDistance / pixelsPerKilometer / clientWalkSpeed,

      // Usa a distancia de source ate a projecao do cliente para saber a distancia do carro
      // Dividimos pela velocidade do carro nesta aresta
      car: distances.projection / this.edge.mapSpeed,
    }

    console.log('Calculado h:', h)

    const projectionCoords = displacePoint(
      this.edge.source,
      distances.projection,
      this.edge.angle
    )

    this.debugLines.push(Debug.drawLine(this.stepper.client, projectionCoords))

    this.debugLines.push(Debug.drawLine(this.edge.source, projectionCoords))
    // Registra
    this.stepper.hCache[this.edge.id] = h

    return h
  }

  // Retorna o custo total deste carro
  get totalCost() {
    // O custo total eh o que demorar mais: o carro chegar no rdv ou o cliente chegar no rdv
    return Math.max(this.g + this.h.car, this.h.client)
  }

  // Deve ser utilziado somente no node inicial, quando o carro se encontra em algum ponto da aresta
  // Nos demais casos, o carro vai ser considerado em source
  calculateExceptionalH(car) {
    // Pegamos as distancias do cliente ate essa aresta
    const distances = this.edge.getDistances(
      this.stepper.client.x,
      this.stepper.client.y
    )

    const carSourceDistance = getDistance(this.edge.source, car)

    // Existem 2 casos:
    // ou o carro esta antes da projecao do cliente e pode passar nela
    if (carSourceDistance <= distances.projection) {
      // Calcula a distancia minima do cliente ate a aresta
      const clientDistance = Math.sqrt(
        distances.sourceSquared - Math.pow(distances.projection, 2)
      )

      this.#exceptionalH = {
        // Nesse caso o cliente anda ate sua projecao
        // A distancia em pixels eh calculada em km, e em seguida divididmos pela velocidade de andar do cliente para achar o tempo em horas
        client: clientDistance / pixelsPerKilometer / clientWalkSpeed,

        // O carro vai andar somente sua distancia ate a projecao
        car: (distances.projection - carSourceDistance) / this.edge.mapSpeed,
      }

      const projectionCoords = displacePoint(
        this.edge.source,
        distances.projection,
        this.edge.angle
      )

      this.debugLines.push(
        Debug.drawLine(this.stepper.client, projectionCoords)
      )

      this.debugLines.push(Debug.drawLine(car, projectionCoords))
    }
    // ou ele esta depois, e como nao pode voltar, o cliente tera q andar ate ele
    else {
      this.#exceptionalH = {
        // Nesse caso o cliente anda ate o carro
        client:
          getDistance(this.stepper.client, car) /
          pixelsPerKilometer /
          clientWalkSpeed,

        // O carro fica parado
        car: 0,
      }

      this.debugLines.push(Debug.drawLine(this.stepper.client, car))
    }

    console.log('Calculado h excepcional:', this.#exceptionalH)
  }

  // Verifica se o novo pai resultaria num custo menor
  considerNewParent(newParent) {
    const newG = newParent.g + newParent.time

    // Se for menos custoso
    if (newG < this.g) {
      // Troca o pai
      this.parent = newParent
      this.g = newG
    }
  }

  // Se fecha, e retorna todas as arestas vizinhas da aresta deste node
  expand() {
    this.closed = true

    // Retorna uma copia do vetor
    return [...this.edge.destination.sourceOf]
  }
}

// Seleciona o subconjunto de carros que serao analisados para encontrar um melhor caminho para o cliente fornecido
function getSubsetOfCarsFor(client) {
  // Por enquanto, vamos analisar todos os carros
  return Object.values(Drawable.drawableInstances[Car.name])
}
