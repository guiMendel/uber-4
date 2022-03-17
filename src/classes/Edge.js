import appConfig from '../configuration/appConfig'
import Vertex from './Vertex'

// Define uma aresta
export default class Edge {
  // Um objeto que vai mapear todos os IDs de edges para as arestas correspondentes
  static edges = {}

  // Descobre a real velocidade da aresta, com base no seu comprimento e velocidade bruta
  static getMapSpeed(realDistance, mapDistance, realSpeed) {
    return (mapDistance * realSpeed) / realDistance
  }

  get mapDistance() {
    return Vertex.getDistance(this.source, this.destination)
  }

  // Se for fornecido um mapSpeed, ele eh utilizado. Se nao, usa-se os valores reais para calcular o mapSpeed
  constructor(id, source, destination, { mapSpeed, realDistance, realSpeed }) {
    // Encontra a velocidade de mapa, se ja nao estiver definida
    mapSpeed ??= Edge.getMapSpeed(realDistance, this.mapDistance, realSpeed)

    // Se este id ja tiver sido previamente declarado
    if (Edge.edges[id] != undefined) {
      const existingEdge = Edge.edges[id]

      // Verifique que a origem e destino coincidem. Se nao, erro
      if (
        existingEdge.source != source ||
        existingEdge.destination != destination
      )
        throw new Error(
          `Tentativa de redefinir aresta de id "${id}". Origem e destino previamente definidos, respectivamente: (${existingEdge.source.x}, ${existingEdge.source.y}); (${existingEdge.destination.x}, ${existingEdge.destination.y}), novos valores: (${source.x}, ${source.y}); (${destination.x}, ${destination.y})`
        )

      // Verifique que a velocidade de mapa coincide. Se nao, erro
      if (mapSpeed == existingEdge.mapSpeed)
        throw new Error(
          `Tentativa de redefinir aresta de id "${id}". Velocidade de mapa previamente definido: ${existingEdge.mapSpeed}, novo valor: ${mapSpeed}`
        )

      return existingEdge
    }

    // Saida e destino
    this.source = source
    this.destination = destination
    this.mapSpeed = mapSpeed

    // Registrar aresta
    Edge.edges[id] = this
  }
}
