// Fornece uma implementacao de binary search
// Retorna o indice do valor mais proximo do valor recebido
export function binarySearch(array, searchValue, limit = 0) {
  return findFittest(array, (value) => value - searchValue, limit)
}

// Retorna o intervalo de indices dos valores que mais se aproximaram de 0 quando aplicados no callback
// Se for fornecido um limit, retorna vetor vazio se o valor absoluto mais proximo de 0 ainda for maior que limit
// Essa funcao ASSUME que os valores do vetor estao ordenados em relacao aos seus resultados quando aplicados em callback, DE MENOR PARA MAIOR
export function findFittest(array, evaluate, limit) {
  if (array.length == 0) return []

  const validateLimit = (index) => {
    if (limit != undefined && Math.abs(evaluate(array[index])) > limit)
      return []
    return getAllEqualValues(array, index, evaluate)
  }

  // Procura a partir dos indices iniciais

  // Lower bound eh o indice do menor valor ainda elegivel
  let lowerBound = 0

  // Uper bound esta 1 acima do indice do maior valor ainda elegivel
  let upperBound = array.length

  // Se lower bound for menor, ainda existem valores elegiveis
  while (lowerBound < upperBound) {
    // Encontra o indice do meio
    const midPoint = lowerBound + Math.floor((upperBound - lowerBound) / 2)

    // Verifica a validade deste indice comparado a 0
    if (evaluate(array[midPoint]) < 0) lowerBound = midPoint + 1
    // Como upperbound ja eh um acima do elegivel, nao devemos subtrair 1 do indice
    else if (evaluate(array[midPoint]) > 0) upperBound = midPoint
    // Se nao eh maior nem menor, encontramos 0!
    else return getAllEqualValues(array, midPoint, evaluate)
  }

  // O indice final eh o indice do menor valor positivo, e o indice anterior, do maior valor negativo (presentes no vetor e diferentes de 0)
  // Vamos descobrir qual dos 2 eh o mais proximo de 0
  // Mas antes, vamos garantir que os 2 bounds sao iguais
  if (lowerBound != upperBound)
    throw new Error(
      'Unexpected behavior inside findSmallestValues function: lowerBound and upperBound contain different values after an inconclusive search'
    )

  // Se lowerBound ainda for 0, nao existem valores negativos, e por isso o positivo eh o mais proxcimo
  if (lowerBound == 0) return validateLimit(lowerBound)

  // Se lowerBound virou o tamanho do array, nao existem valores positivos, e por isso o negativo eh o mais proxcimo
  if (lowerBound == array.length) return validateLimit(lowerBound - 1)

  if (evaluate(array[lowerBound - 1]) >= 0)
    throw new Error(
      `Unexpected behavior inside findSmallestValues function: final index minus one results in non negative value (${evaluate(
        array[lowerBound - 1]
      )})`
    )

  if (evaluate(array[lowerBound]) <= 0)
    throw new Error(
      `Unexpected behavior inside findSmallestValues function: final index results in non negative value (${evaluate(
        array[lowerBound]
      )})`
    )

  // Do contrario, comparamos
  if (
    Math.abs(evaluate(array[lowerBound - 1])) <
    Math.abs(evaluate(array[lowerBound]))
  )
    return validateLimit(lowerBound - 1)

  return validateLimit(lowerBound)
}

// Retorna um vetor intervalo com os indices cujos elementos resultam no mesmo valor de evaluate que o indice fornecido
// Assume as mesmas coisas que as demais funcoes sobre o vetor
function getAllEqualValues(array, index, evaluate) {
  // Helpers
  const value = evaluate(array[index])
  const evalIndex = (i) => evaluate(array[i])

  // Valor final
  const result = [index, index + 1]

  // Realiza buscas pra esquerda a pra direita para encontrar os limites do intervalo de elementos com o mesmo valor

  // Verifica a necessidade de buscar para a esquerda: se o elemento da esquerda tambem eh value
  if (index > 0 && evalIndex(index - 1) == value) {
    let lowerBound = 0
    // Pulamos o primeiro da esquerda, pois ja sabemos que ele eh = value
    let upperBound = index - 1

    // Se lower bound for menor, ainda existem valores elegiveis
    while (lowerBound < upperBound) {
      // Encontra o indice do meio
      const midPoint = lowerBound + Math.floor((upperBound - lowerBound) / 2)

      // Verifica se o elemento correspondente eh do mesmo valor. Se nao, sobe o lowerBound
      if (evalIndex(midPoint) != value) lowerBound = midPoint + 1
      // Como upperbound ja eh um acima do elegivel, nao devemos subtrair 1 do indice
      else upperBound = midPoint
    }

    // Ao final, upperBound aponta para o indice da primeira occorencia
    result[0] = upperBound
  }

  // Verifica a necessidade de buscar para a direita: se o elemento da direita tambem eh value
  if (index < array.length - 1 && evalIndex(index + 1) == value) {
    // Pulamos o primeiro da direita, pois ja sabemos que ele eh = value
    let lowerBound = index + 2
    let upperBound = array.length

    // Se lower bound for menor, ainda existem valores elegiveis
    while (lowerBound < upperBound) {
      // Encontra o indice do meio
      const midPoint = lowerBound + Math.floor((upperBound - lowerBound) / 2)

      // Verifica se o elemento correspondente eh do mesmo valor. Se nao, desce o upperBound
      if (evalIndex(midPoint) != value) upperBound = midPoint
      // Como upperbound ja eh um acima do elegivel, nao devemos subtrair 1 do indice
      else lowerBound = midPoint + 1
    }

    // Ao final, upperBound aponta para 1 + o indice da ultima occorencia
    result[1] = upperBound
  }

  return result
}

// Retorna o valor cuja avaliacao mais se aproxima de 0
// Nao assume nada sobre o vetor
export function unorderedFindFittest(
  array,
  evaluate,
  limit,
  interval,
  returnIndex
) {
  if (array.length == 0) return null

  // Encontra um valor que consiga superar o limite
  let bestValueSoFar = limit ? limit + 1 : 99999999
  let bestElementIndex = null

  const considerElement = (index) => {
    const elementValue = Math.abs(evaluate(array[index]))

    if (elementValue < bestValueSoFar) {
      bestElementIndex = index
      bestValueSoFar = elementValue
    }
  }

  // Se nao ha intervalo
  if (interval == undefined)
    for (const elementIndex in array) considerElement(elementIndex)
  // Caso haja um intervalo
  else for (let i = interval[0]; i < interval[1]; i++) considerElement(i)

  return returnIndex ? bestElementIndex : array[bestElementIndex]
}
