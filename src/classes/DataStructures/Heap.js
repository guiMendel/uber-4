// Define uma estrutura de dados do tipo Heap
export default class Heap {
  // Vai armazenar os dados
  #data = []

  // compareMethod vai permitir definir a prioridade dos elementos do heap. Recebe 2 elementos, e deve retornar true se o primeiro tem mais prioridade do que o segundo
  constructor(compareMethod) {
    // Armazena o metodo de comparacao
    this.compare = compareMethod
  }

  get length() {
    return this.#data.length
  }

  // Permite adicionar um novo elemento ao heap
  insert(element) {
    // Insere o elemento no ultimo espaco
    this.#data.push(element)

    // Realiza swim up do novo elemento
    this.#swimUp(this.length - 1)
  }

  // Permite retirar o elemento de maior prioridade do heap
  pop() {
    if (this.length == 0) return undefined

    // Pega o elemento com maior prioridade
    const returnValue = this.#data[0]

    // Se so tinha um elemento, limpa
    if (this.length == 1) this.#data.pop()
    // Se nao, substitui o primeiro pelo o ultimo elemento
    else this.#data[0] = this.#data.pop()

    // Faz o swim down
    this.#swimDown(0)

    return returnValue
  }

  // Define como o elemento faz swim up no array que armazena os dados do heap
  #swimUp(index) {
    if (index == 0) return

    // Verifica se eh maior que o pai
    if (this.compare(this.#data[index], this.#data[this.#getParent(index)])) {
      // Troca com o pai
      this.#swap(index, this.#getParent(index))

      // Continua nadando
      this.#swimUp(this.#getParent(index))
    }
  }

  // Define como o elemento faz swim up no array que armazena os dados do heap
  #swimDown(index) {
    // Encontra qual dos 2 filhos eh o maior
    const [childA, childB] = [index * 2 + 1, index * 2 + 2]

    // Verifica se ambos nao existem
    if (childA >= this.length) return

    // Encontra o maior filho
    let biggerChild

    // Se o 2 nao existe, eh o primeiro
    if (childB >= this.length) biggerChild = childA
    // Compara eles
    else
      biggerChild = this.compare(this.#data[childA], this.#data[childB])
        ? childA
        : childB

    // Se o filho for maior
    if (this.compare(this.#data[biggerChild], this.#data[index])) {
      // Troca
      this.#swap(index, biggerChild)

      // Continua a nadar
      this.#swimDown(biggerChild)
    }
  }

  // Retorna o no pai do filho indicado pelo indice
  #getParent(index) {
    if (index == 0)
      throw new Error('Impossível realizar swimUp a partir do índice 0')

    return Math.floor((index - 1) / 2)
  }

  // Troca os 2 elementos
  #swap(indexA, indexB) {
    const cache = this.#data[indexA]
    this.#data[indexA] = this.#data[indexB]
    this.#data[indexB] = cache
  }
}
