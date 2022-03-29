// Fornece uma implementacao de binary search
// Retorna o indice do valor se estiver presente, se nao retorna null
export function binarySearch(array, value) {
  const index = array.indexOf(value)

  return index == -1 ? null : index
}

// Retorna um vetor com o valor que resultou no menor resultado. Se mais de um valor der esse mesmo resultado, retorna todos
export function findSmallestValues(array, getResult) {
  let lowestSoFar = 999999999

  let bestValues = []

  for (const value of array) {
    const result = getResult(value)

    if (result < lowestSoFar) {
      lowestSoFar = result
      bestValues = [value]
    }

    // Se forem de mesma distancia, adiciona esse caboclo
    else if (result == lowestSoFar) {
      bestValues.push(value)
    }
  }

  return bestValues
}
