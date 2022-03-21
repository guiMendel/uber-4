import Drawable from '../classes/Drawable'
import Edge from '../classes/Edge'
import Vertex from '../classes/Vertex'
import appConfig from '../configuration/appConfig'

const { pixelsPerKilometer } = appConfig

// Gera grafos e arestas aleatorios para fins de teste
export default function seedGraph(numberOfVertices = 10, mapPadding = 20) {
  // Destroi os anteriormente definidos
  Drawable.drawableInstances = {}

  if (numberOfVertices <= 1)
    throw new Error('Necessita de pelo menos 2 vertices')

  // Helper para gerar coordenada aleatoria
  const randomForLength = (length) =>
    mapPadding + Math.random() * (length - mapPadding * 2)

  // Gerar vertices
  for (let vertexId = 0; vertexId < numberOfVertices; vertexId++) {
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

  // Gerar arestas para cada vertice
  for (let edgeId = 0; edgeId < numberOfVertices; edgeId++) {
    new Edge(
      edgeId,
      Drawable.drawableInstances[Vertex.name][edgeId],
      Drawable.drawableInstances[Vertex.name][randomVertexIdExcept(edgeId)],
      {
        mapSpeed: randomSpeed(),
      }
    )
  }
}
