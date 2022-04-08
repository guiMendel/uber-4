import Heap from '../../classes/DataStructures/Heap'
import Node from './Node'

// Helper para criar um Heap de nodes
export const newNodeHeap = () =>
  new Heap((nodeA, nodeB) => {
    if (nodeA.totalCost < nodeB.totalCost) return true
    if (nodeA.totalCost > nodeB.totalCost) return false

    // Se os custos sao iguais, o maior custo dos 2 eh igual. Entao, comparamos o menor custo
    if (nodeA.g + nodeA.h.car < nodeB.g + nodeB.h.car) return true
    if (nodeA.h.client < nodeB.h.client) return true

    return false
  })

// Gera uma estrutura que, dado um ponto de inicio e um destino, e um cache de h, armazena os nos descobertos e fornece uma interface para realizar os passos do A* modificado
export default class AStarStepper {
  // Listeners the quando houver um novo best path
  #newBestListeners = []

  // OpenNodes e closedNodes sao heaps, que da prioridade para nos com menor custo total
  openNodes = newNodeHeap()

  closedNodes = newNodeHeap()

  // Aqui nos guardamos a relacao edge/node
  // A chave vai ser o id da edge, o vlaor vai ser o node
  edgeToNode = {}

  constructor(
    destination,
    source,
    startingEdge,
    hCache,
    iterationCallbacks,
    parentNode
  ) {
    // Armazena o carro & cliente
    this.source = source
    this.destination = destination
    this.hCache = hCache
    this.iterationCallbacks = iterationCallbacks
    this.parentNode = parentNode

    // Inicializa o primeiro no
    this.#registerNodeFor(startingEdge, null, source, parentNode?.totalCost)

    // Levanta evento de new best sempre que o closed nodes tiver um novo highest priority
    this.closedNodes.onNewHighestPriority(() => {
      for (const listener of this.#newBestListeners) listener()
    })
  }

  get car() {
    if (this.parentNode != null) return this.parentNode.stepper.car
    else return this.source
  }

  get client() {
    if (this.parentNode != null) return this.parentNode.stepper.client
    else return this.destination
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
  #registerNodeFor(edge, parentNode, source, additionalCost) {
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
    const node = new Node(parentNode, edge, this, source, additionalCost)

    this.openNodes.insert(node)
    this.edgeToNode[edge.id] = node
  }
}
