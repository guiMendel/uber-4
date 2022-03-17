import Edge from '../classes/Edge'
import Vertex from '../classes/Vertex'
import appConfig from '../configuration/appConfig'

const { pixelsPerKilometer } = appConfig

// Gera grafos e arestas aleatorios para fins de teste
export default function seedGraph(
  numberOfVertices = 100,
  numberOfEdges = 200,
  mapPadding = 30
) {
  if (numberOfVertices <= 1)
    throw new Error('Necessita de pelo menos 2 vertices')

  // Helper para gerar coordenada aleatoria
  const randomForLength = (length) =>
    mapPadding + Math.random() * (length - mapPadding * 2)

  // Gerar vertices
  for (const vertexId = 0; vertexId < numberOfVertices; vertexId++) {
    new Vertex(
      vertexId,
      randomForLength(window.innerWidth),
      randomForLength(window.innerHeight),
      true
    )
  }

  // Helpers para pegar vertice aleatorio
  const randomVertexId = () => Math.floor(Math.random() * numberOfVertices)
  const randomVertexIdExcept = (exceptId = null) => {
    const vertexId = randomVertexId()
    // Se gerou o mesmo id de except, tente outra vez
    return exceptId == vertexId ? randomVertexIdExcept() : vertexId
  }

  // Gera uma velocidade aleatoria
  const randomSpeed = () => {
    const realSpeedRange = [30, 100]
    const mapSpeedRange = [
      realSpeedRange[0] * pixelsPerKilometer,
      realSpeedRange[1] * pixelsPerKilometer,
    ]

    return (
      Math.random() * (mapSpeedRange[1] - mapSpeedRange[0]) + mapSpeedRange[0]
    )
  }

  // Gerar arestas
  for (const edgeId = 0; edgeId < numberOfEdges; edgeId++) {
    const sourceVertexId = randomVertexId()
    new Edge(
      edgeId,
      Vertex.vertices[sourceVertexId],
      Vertex.vertices[randomVertexIdExcept(sourceVertexId)],
      { mapSpeed: randomSpeed() }
    )
  }
}
