import Heap from '../../classes/DataStructures/Heap'
import Node from './Node'

// Helper para criar um Heap de nodes
export const newNodeHeap = () =>
  new Heap((nodeA, nodeB) => nodeA.totalCost < nodeB.totalCost)

// Gera uma estrutura que, dado um carro e um cache de h, armazena os nos descobertos e fornece uma interface para realizar os passos do A* modificado
export default class AStarStepper {
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
