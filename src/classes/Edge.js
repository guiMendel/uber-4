import theme from '../configuration/theme'
import Drawable from './Drawable'
import Vertex from './Vertex'

// Extrai valores uteis
const { streetColorSlowest, streetWidth, streetColorHighest } = theme

// Helpers
// Trigonometry
const sin = (angle) => Math.sin(angle * (Math.PI / 180))
const cos = (angle) => Math.cos(angle * (Math.PI / 180))

// Define uma aresta
export default class Edge extends Drawable {
  // Descobre a real velocidade da aresta, com base no seu comprimento e velocidade bruta
  static getMapSpeed(realDistance, mapDistance, realSpeed) {
    return (mapDistance * realSpeed) / realDistance
  }

  // Sempre guarda o valor da rua mais lenta
  static slowestEdge

  // Sempre guarda o valor da rua mais rapida
  static fastestEdge

  // Se for fornecido um mapSpeed, ele eh utilizado. Se nao, usa-se os valores reais para calcular o mapSpeed
  constructor(id, source, destination, { mapSpeed, realDistance, realSpeed }) {
    // Encontra a velocidade de mapa, se ja nao estiver definida
    mapSpeed ??= Edge.getMapSpeed(realDistance, this.mapDistance, realSpeed)

    // Invoca construtor pai
    super(id, { source, destination, mapSpeed })

    // Atualiza as ruas mais rapida e lenta
    this.updateRecordEdges()
  }

  // Se desenha
  draw(context) {
    // Desenha uma linha do vertice origem para o vertice destino
    context.strokeStyle = this.streetColor
    context.lineWidth = streetWidth

    context.beginPath()

    context.moveTo(this.source.x, this.source.y)

    context.lineTo(this.destination.x, this.destination.y)

    context.stroke()
  }

  // Retorna o angulo desta aresta
  get angle() {
    return (
      (Math.atan(
        (this.destination.x - this.source.x) /
          (this.destination.y - this.source.y)
      ) *
        180) /
        Math.PI +
      (this.destination.y < this.source.y ? 180 : 0)
    )
  }

  // Retorna a distancia em pixels entre source e destination
  get mapDistance() {
    return Vertex.getDistance(this.source, this.destination)
  }

  // Calcula a cor desta rua
  get streetColor() {
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

  updateRecordEdges() {
    // Encontra a rua com a menor e a maior velocidade
    const streets = Object.values(this.instances)

    Edge.slowestEdge = streets.reduce((previousMin, newStreet) => {
      if (previousMin.mapSpeed <= newStreet.mapSpeed) return previousMin
      else return newStreet
    })

    Edge.fastestEdge = streets.reduce((previousMin, newStreet) => {
      if (previousMin.mapSpeed >= newStreet.mapSpeed) return previousMin
      else return newStreet
    })
  }

  // Dado um ponto de coordenadas x e y, encontra as coordenadas da projecao deste ponto na reta desta aresta
  getProjectionCoordinates(x, y) {
    // Encontramos as distancias do ponto para source e destination
    const [sourceDistance, destinationDistance] = [
      Vertex.getSquaredDistance(this.source, { x, y }),
      Vertex.getSquaredDistance(this.destination, { x, y }),
    ]

    // Usamos uma equacao para encontrar o quao longe na aresta esta esta projecao, saido de source
    const displacement =
      (sourceDistance - destinationDistance) / (2 * this.mapDistance) +
      this.mapDistance / 2

    // Encontramos as coordenadas da projecao aplicando o deslocamento em source
    return [
      this.source.x + sin(this.angle) * displacement,
      this.source.y + cos(this.angle) * displacement,
    ]
  }
}
