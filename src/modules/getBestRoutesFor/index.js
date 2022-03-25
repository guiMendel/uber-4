import Car from '../../classes/Drawables/Car'
import Drawable from '../../classes/Drawables/Drawable'
import appConfig from '../../configuration/appConfig'
import AStarStepper, { newNodeHeap } from './AStarStepper'

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

const { pathExpansionIterations, newBestPathReward, countOfNodesToConsider } =
  appConfig

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

// Seleciona o subconjunto de carros que serao analisados para encontrar um melhor caminho para o cliente fornecido
function getSubsetOfCarsFor(client) {
  // Por enquanto, vamos analisar todos os carros
  return Object.values(Drawable.drawableInstances[Car.name])
}
