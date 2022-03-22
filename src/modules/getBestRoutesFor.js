import Heap from '../classes/DataStructures/Heap'
import Car from '../classes/Drawables/Car'
import Vertex from '../classes/Drawables/Vertex'
import Drawable from '../classes/Drawables/Drawable'
import appConfig from '../configuration/appConfig'

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
} = appConfig

// Encontra as rotas mais rapidas par aque um cliente chegue em seu destino, e com quais carros
export default function getBestRoutesFor(client) {
  // Subconjunto de carros para analise
  const cars = getSubsetOfCarsFor(client)

  // Inicializa um cache para armazenar os valores calculados de h
  // A chave sera o id da aresta, o valor sera o objeto resultado de executar h com essa aresta
  const hCache = {}

  // Contara as iteracoes totais. Ja coloca o valor inicial
  let totalIterations = pathExpansionIterations

  // Inicia as iteracoes de A*
  for (let iteration = 0; iteration < totalIterations; iteration++) {}
}

// Gera uma estrutura que, dado um carro e um cache de h, armazena os nos descobertos e fornece uma interface para realizar os passos do A* modificado
class AStarStepper {
  // Open node eh um heap, que da prioridade para nos com menor custo total
  openNodes = new Heap((nodeA, nodeB) => nodeA.totalCost < nodeB.totalCost)

  constructor(client, car, hCache) {
    // Armazena o carro & cliente
    this.car = car
    this.client = client
    this.hCache = hCache

    // Inicializa o primeiro no
    this.openNodes.insert(new Node(null, car.edge, this, car))
  }

  step() {}
}

// Define cada no do A*
class Node {
  constructor(parent, edge, stepper, car) {
    this.stepper = stepper
    this.edge = edge
    this.parent = parent

    // A partir do pai, descobre o seu g
    this.g = parent == null ? 0 : parent.g + parent.time

    // A partir da edge, descobre seu time
    this.time = edge.mapDistance / edge.mapSpeed

    // Se recebemos o carro, calculamos um valor de h excepcional
    if (car != undefined) calculateExceptionalH(car)
  }

  // Retorna o valor de h sobre esse no. Consulta o hCache, mas se n tiver registro, realiza o calculo e registra
  get h() {
    // Se houver um valor excepcional de h para este no, usamos ele
    if (this.#h != undefined) return this.#h

    // Verifica se ja ha registro
    if (this.stepper.hCache[this.edge.id] != undefined)
      return this.hCache[this.edge.id]

    // Se nao, calcula
    const distances = edge.getDistances(
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

    // Registra
    this.stepper.hCache[this.edge.id] = h

    return h
  }

  // Retorna o custo total deste carro
  get totalCost() {
    // O custo total eh o que demorar mais: o carro chegar no rdv ou o cliente chegar no rdv
    return Math.max(this.g + this.h.car, this.h.client)
  }

  // Deve se rutilziado somente par ao no inicial, quando o carro se encontra em algum ponto da aresta
  // Nos demais casos, o carro vai ser considerado em source
  calculateExceptionalH(car) {
    // Pegamos as distancias do cliente ate essa aresta
    const distances = edge.getDistances(
      this.stepper.client.x,
      this.stepper.client.y
    )

    const carSourceDistance = Vertex.getDistance(this.edge.source, car)

    // Existem 2 casos:
    // ou o carro esta antes da projecao do cliente e pode passar nela
    if (carSourceDistance <= distances.projection) {
      // Calcula a distancia minima do cliente ate a aresta
      const clientDistance = Math.sqrt(
        distances.sourceSquared - Math.pow(distances.projection, 2)
      )

      this.#h = {
        // Nesse caso o cliente anda ate sua projecao
        // A distancia em pixels eh calculada em km, e em seguida divididmos pela velocidade de andar do cliente para achar o tempo em horas
        client: clientDistance / pixelsPerKilometer / clientWalkSpeed,

        // O carro vai andar somente sua distancia ate a projecao
        car: (distances.projection - carSourceDistance) / this.edge.mapSpeed,
      }
    }
    // ou ele esta depois, e como nao pode voltar, o cliente tera q andar ate ele
    else {
      this.#h = {
        // Nesse caso o cliente anda ate o carro
        client:
          Vertex.getDistance(this.stepper.client, car) /
          pixelsPerKilometer /
          clientWalkSpeed,

        // O carro fica parado
        car: 0,
      }
    }
  }
}

// Seleciona o subconjunto de carros que serao analisados para encontrar um melhor caminho para o cliente fornecido
function getSubsetOfCarsFor(client) {
  // Por enquanto, vamos analisar todos os carros
  return Object.values(Drawable.drawableInstances[Car.name])
}
