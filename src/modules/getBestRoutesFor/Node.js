import Debug from '../../classes/Drawables/Debug'
import Configuration from '../../configuration/Configuration'
import { displacePoint, getDistance } from '../../helpers/vectorDistance'

// Define cada no do A*
export default class Node {
  // Guarda as linhas de debug que esta desenhando
  debugLines = []

  // Se este node ja foi expandido
  closed = false

  // Este campo aramazenara o valor de h se ele for excepcional para este node
  #exceptionalH = undefined

  constructor(
    parent,
    edge,
    stepper,
    source,
    additionalCost,
    isSequential = false
  ) {
    this.stepper = stepper
    this.edge = edge
    this.parent = parent
    this.isSequential = isSequential

    // A partir do pai, descobre o seu g
    this.g = parent == null ? 0 : parent.g + parent.time

    // Se tiver um custo adicional
    if (additionalCost) this.g += additionalCost

    // Se recebemos o source, calculamos um valor de h e time excepcional
    if (source != null) {
      this.source = source
      this.time = getDistance(source, edge.destination) / edge.mapSpeed
      this.calculateExceptionalH(source)
    } else {
      // A partir da edge, descobre seu time
      this.time = edge.mapDistance / edge.mapSpeed
    }

    stepper.iterationCallbacks.push(() => {
      this.debugLines.forEach((line) => line())
      this.debugLines = []
    })
  }

  // Retorna o valor de h sobre esse no. Consulta o hCache, mas se n tiver registro, realiza o calculo e registra
  get h() {
    const { clientWalkSpeed, pixelsPerKilometer } =
      Configuration.getInstance().general

    // Se houver um valor excepcional de h para este no, usamos ele
    if (this.#exceptionalH != undefined) return this.#exceptionalH

    if (this.stepper.hCache[this.edge.id] != undefined) {
      this.projectionCoords = this.stepper.hCache[this.edge.id].projectionCoords
      return this.stepper.hCache[this.edge.id].h
    }

    // Se nao, calcula
    const distances = this.edge.getDistances(this.stepper.destination)

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

    this.projectionCoords = displacePoint(
      this.edge.source,
      distances.projection,
      this.edge.angle
    )

    this.debugLines.push(
      Debug.drawLine(this.stepper.destination, this.projectionCoords)
    )

    this.debugLines.push(
      Debug.drawLine(this.edge.source, this.projectionCoords)
    )
    // Registra
    this.stepper.hCache[this.edge.id] = {
      h,
      projectionCoords: this.projectionCoords,
    }

    return h
  }

  // Retorna o custo total deste carro
  get totalCost() {
    // O custo total eh o que demorar mais: o carro chegar no rdv ou o cliente chegar no rdv
    return this.isSequential
      ? this.g + this.h.car + this.h.client
      : Math.max(this.g + this.h.car, this.h.client)
  }

  // Retorna o custo total mas considera o tempo do cliente muito mais lento
  get totalCostSlowClient() {
    return this.isSequential
      ? this.g + this.h.car + this.h.client * 10
      : Math.max(this.g + this.h.car, this.h.client * 10)
  }

  // Deve ser utilziado somente no node inicial, quando o carro se encontra em algum ponto da aresta
  // Nos demais casos, o carro vai ser considerado em source
  calculateExceptionalH(source) {
    const { clientWalkSpeed, pixelsPerKilometer } =
      Configuration.getInstance().general

    // Pegamos as distancias do cliente ate essa aresta
    const distances = this.edge.getDistances(this.stepper.destination)

    const carSourceDistance = getDistance(this.edge.source, source)

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

      this.projectionCoords = displacePoint(
        this.edge.source,
        distances.projection,
        this.edge.angle
      )

      this.debugLines.push(
        Debug.drawLine(this.stepper.destination, this.projectionCoords)
      )

      this.debugLines.push(Debug.drawLine(source, this.projectionCoords))
    }
    // ou ele esta depois, e como nao pode voltar, o cliente tera q andar ate ele
    else {
      this.projectionCoords = { x: source.x, y: source.y }

      this.#exceptionalH = {
        // Nesse caso o cliente anda ate o carro
        client:
          getDistance(this.stepper.destination, source) /
          pixelsPerKilometer /
          clientWalkSpeed,

        // O carro fica parado
        car: 0,
      }

      this.debugLines.push(Debug.drawLine(this.stepper.destination, source))
    }
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

    return Object.values(this.edge.destination.sourceOf)
  }

  // Retorna verdadeiro se os 2 nodes sao iguais
  isEqualTo(node) {
    return (
      this.edge.id == node.edge.id && this.stepper.car.id == node.stepper.car.id
    )
  }
}
