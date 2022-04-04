import Heap from './DataStructures/Heap'

// O objetivo desta classe eh fornecer uma estrutura capaz de:
// 1. Registrar novas instancias de um objeto especifico
// 2. A cada instancia registrada, de acordo com sua configuracao, le as propriedades da instancia e as adiciona a heaps
// 3. Fornece um vetor ordenado de cada uma dessas propriedades lidas

export default class SortProperties {
  // Guarda os heaps das propriedades ordenadas
  properties = {}

  // Essa configuracao eh um objeto que deve seguir a seguinte sintaxe:
  // Cada chave deste objeto deve ser o nome de uma das propriedades que vao ser lidas das instancias registradas
  // As chaves devem apontar para um metodo que descreve como ordenar seus valores (eh exatamente o metodo que vai ser passado como parametro para o Heap)
  constructor(propertiesConfiguration) {
    // Pra cada propriedade
    for (const [property, propertySorter] of Object.entries(
      propertiesConfiguration
    )) {
      // Adiciona um heap para esta properiedade (e ativa o modo de sempre gerar um array)
      this.properties[property] = new Heap(propertySorter, true)
    }
  }

  remove(instance) {
    // Pra cada propriedade
    for (const propertyHeap of Object.values(this.properties)) {
      // Adiciona essa propriedade
      propertyHeap.remove(instance)
    }
  }

  // Registra as propriedades desta instancia nas lsitas ordenadas
  register(instance) {
    // Pra cada propriedade
    for (const propertyHeap of Object.values(this.properties)) {
      // Adiciona essa propriedade
      propertyHeap.insert(instance)
    }
  }

  // Retorna a lista ordenada desta propriedade
  get(property) {
    return this.properties[property].array
  }
}
