import theme from '../../configuration/theme'
import { sin, cos } from '../../helpers/trygonometry'
import {
  angleBetween,
  getDistance,
  getSquaredDistance,
} from '../../helpers/vectorDistance'
import SortProperties from '../SortProperties'

import Drawable from './Drawable'

// Extrai valores uteis
const { streetColorSlowest, streetWidth, streetColorHighest } = theme

// Define uma aresta
export default class Edge extends Drawable {
  // Guarda as arestas ordenadas pelas coordenadas
  static sortedCoords = new SortProperties({
    leftVertexX: (e1, e2) => e1.leftVertex.x < e2.leftVertex.x,
    rightVertexX: (e1, e2) => e1.rightVertex.x < e2.rightVertex.x,
    upperVertexY: (e1, e2) => e1.upperVertex.y < e2.upperVertex.y,
    lowerVertexY: (e1, e2) => e1.lowerVertex.y < e2.lowerVertex.y,
  })

  // Descobre a real velocidade da aresta, com base no seu comprimento e velocidade bruta
  static getMapSpeed(realDistance, mapDistance, realSpeed) {
    return (mapDistance * realSpeed) / realDistance
  }

  // Sempre guarda o valor da rua mais lenta
  static slowestEdge

  // Sempre guarda o valor da rua mais rapida
  static fastestEdge

  // Quais carros estao neste edge, pelo id
  cars = {}

  // Se for fornecido um mapSpeed, ele eh utilizado. Se nao, usa-se os valores reais para calcular o mapSpeed
  constructor(id, source, destination, { mapSpeed, realDistance, realSpeed }) {
    // Erro se source e destination forem iguais
    if (source.id == destination.id)
      throw new Error(
        `Tentativa de criar aresta saindo e chegando no mesmo vertice de id ${source.id}`
      )

    // Encontra a velocidade de mapa, se ja nao estiver definida
    mapSpeed ??= Edge.getMapSpeed(realDistance, this.mapDistance, realSpeed)

    // console.log(`New edge with speed ${mapSpeed / pixelsPerKilometer}`)

    // Invoca construtor pai
    super(id, { source, destination, mapSpeed, realDistance })

    // Avisa os vertices de sua existencia
    source.sourceOf[this.id] = this
    destination.destinationOf[this.id] = this

    this.onDestroy.push(() => {
      delete source.sourceOf[this.id]
      delete destination.destinationOf[this.id]
    })

    // Atualiza as ruas mais rapida e lenta
    this.updateRecordEdges()

    this.onDestroy.push(() => {
      if (Edge.slowestEdge == this) this.updateRecordEdges(this)
      else if (Edge.fastestEdge == this) this.updateRecordEdges(this)
    })

    // console.log(`from ${source.id} to ${destination.id}`)

    if (source.x <= destination.x) {
      this.leftVertex = source
      this.rightVertex = destination
    } else {
      this.leftVertex = destination
      this.rightVertex = source
    }

    // Lembrando que y cresce pra baixo
    if (source.y <= destination.y) {
      this.upperVertex = source
      this.lowerVertex = destination
    } else {
      this.upperVertex = destination
      this.lowerVertex = source
    }

    // Registra nas listas ordenadas
    Edge.sortedCoords.register(this)

    this.onDestroy.push(() => Edge.sortedCoords.remove(this))
  }

  // Se desenha
  draw(drawer, color) {
    // Desenha uma linha do vertice origem para o vertice destino
    const { strokePath } = drawer.drawWith({
      style: color ?? this.streetColor,
      lineWidth: streetWidth,
    })

    strokePath(this.source, this.destination)
  }

  // Retorna o angulo desta aresta
  get angle() {
    return angleBetween(this.source, this.destination)
  }

  // Retorna a distancia em pixels entre source e destination
  get mapDistance() {
    return getDistance(this.source, this.destination)
  }

  // Calcula a cor desta rua
  get streetColor() {
    if (Edge.slowestEdge.mapSpeed == Edge.fastestEdge.mapSpeed)
      return streetColorHighest

    // Descobre qual a posicao desta rua no ranking de velocidade (de 0 a 1)
    const edgeRanking =
      (this.mapSpeed - Edge.slowestEdge.mapSpeed) /
      (Edge.fastestEdge.mapSpeed - Edge.slowestEdge.mapSpeed)

    // Get the 2 colors as an rgb 3 color array
    const slowColor = [
      parseInt(streetColorSlowest.slice(1, 3), 16),
      parseInt(streetColorSlowest.slice(3, 5), 16),
      parseInt(streetColorSlowest.slice(5, 7), 16),
    ]

    const fastColor = [
      parseInt(streetColorHighest.slice(1, 3), 16),
      parseInt(streetColorHighest.slice(3, 5), 16),
      parseInt(streetColorHighest.slice(5, 7), 16),
    ]

    // Retorna uma interpolacao (graduacao) entre 3 numeros baseada no ranking obtido anteriormente
    const lerpIndexToHex = (index) =>
      Math.round(
        (fastColor[index] - slowColor[index]) * edgeRanking + slowColor[index]
      ).toString(16)

    // Monta a cor desta rua interpolando as cores resultantes
    return '#' + lerpIndexToHex(0) + lerpIndexToHex(1) + lerpIndexToHex(2)
  }

  updateRecordEdges(excluded) {
    // Encontra a rua com a menor e a maior velocidade
    const streets = Object.values(this.instances)

    Edge.slowestEdge = streets.reduce((previousMin, newStreet) => {
      if (
        (previousMin.mapSpeed <= newStreet.mapSpeed &&
          previousMin != excluded) ||
        newStreet == excluded
      )
        return previousMin
      else return newStreet
    })

    Edge.fastestEdge = streets.reduce((previousMax, newStreet) => {
      if (
        (previousMax.mapSpeed >= newStreet.mapSpeed &&
          previousMax != excluded) ||
        newStreet == excluded
      )
        return previousMax
      else return newStreet
    })
  }

  // Dado um ponto de coordenadas x e y, encontra a distancia de sua projecao ate source, e o quadrado de sua distancia ate source e destination
  getDistances(x, y) {
    // Encontramos as distancias do ponto para source e destination
    const [sourceDistance, destinationDistance] = [
      getSquaredDistance(this.source, { x, y }),
      getSquaredDistance(this.destination, { x, y }),
    ]

    // Usamos uma equacao para encontrar o quao longe na aresta esta esta projecao, saido de source
    // Limita seu valor ao tamanho da aresta
    const projectionDistance = Math.max(
      0,
      Math.min(
        (sourceDistance - destinationDistance) / (2 * this.mapDistance) +
          this.mapDistance / 2,
        this.mapDistance
      )
    )

    return {
      sourceSquared: sourceDistance,
      destinationSquared: destinationDistance,
      projection: projectionDistance,
    }
  }

  // Dado um ponto de coordenadas x e y, encontra as coordenadas da projecao deste ponto na reta desta aresta
  getProjectionCoordinates(x, y) {
    // Pegamos a projectionDistance de getProjectionLengths
    const displacement = this.getDistances(x, y).projection

    // Encontramos as coordenadas da projecao aplicando o deslocamento em source
    return [
      this.source.x + sin(this.angle + 90) * displacement,
      this.source.y + cos(this.angle + 90) * displacement,
    ]
  }
}
