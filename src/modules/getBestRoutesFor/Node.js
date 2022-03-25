import Debug from '../../classes/Drawables/Debug'
import appConfig from '../../configuration/appConfig'
import { displacePoint, getDistance } from '../../helpers/vectorDistance'

const { pixelsPerKilometer, clientWalkSpeed } = appConfig

// Define cada no do A*
export default class Node {
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

    if (this.stepper.hCache[this.edge.id] != undefined) {
      this.projectionCoords = this.stepper.hCache[this.edge.id].projectionCoords
      return this.stepper.hCache[this.edge.id].h
    }

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

    this.projectionCoords = displacePoint(
      this.edge.source,
      distances.projection,
      this.edge.angle
    )

    this.debugLines.push(
      Debug.drawLine(this.stepper.client, this.projectionCoords)
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

      this.projectionCoords = displacePoint(
        this.edge.source,
        distances.projection,
        this.edge.angle
      )

      this.debugLines.push(
        Debug.drawLine(this.stepper.client, this.projectionCoords)
      )

      this.debugLines.push(Debug.drawLine(car, this.projectionCoords))
    }
    // ou ele esta depois, e como nao pode voltar, o cliente tera q andar ate ele
    else {
      this.projectionCoords = { x: car.x, y: car.y }

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
