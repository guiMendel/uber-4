import Client from '../classes/Drawables/Client'
import Car from '../classes/Drawables/Car'
import Drawable from '../classes/Drawables/Drawable'
import Edge from '../classes/Drawables/Edge'
import Vertex from '../classes/Drawables/Vertex'
import appConfig from '../configuration/appConfig'
import { sin, cos } from './trygonometry'

const { pixelsPerKilometer } = appConfig

// Gera grafos e arestas aleatorios para fins de teste
export default function seedGraph(
  numberOfVertices = 12,
  numberOfCars = 1,
  numberOfClients = 1,
  mapWidth = window.innerWidth - 20,
  mapHeight = window.innerHeight - 20
) {
  // Destroi os anteriormente definidos
  Drawable.drawableInstances = {}

  if (numberOfVertices <= 1)
    throw new Error('Necessita de pelo menos 2 vertices')

  // Helper para gerar coordenadas aleatorias centralizadas em 0,0
  const randomCoords = () => ({
    x: Math.random() * mapWidth - mapWidth / 2,
    y: Math.random() * mapHeight - mapHeight / 2,
  })

  // Gerar vertices
  for (let vertexId = 0; vertexId < numberOfVertices; vertexId++) {
    new Vertex(vertexId, randomCoords().x, randomCoords().y, true)
  }

  // Helpers para pegar vertice aleatorio
  const randomVertexId = () => Math.floor(Math.random() * numberOfVertices)
  const randomVertexIdExcept = (exceptId = null) => {
    const vertexId = randomVertexId()
    // Se gerou o mesmo id de except, tente outra vez
    return exceptId == vertexId ? randomVertexIdExcept(exceptId) : vertexId
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

  // Pega uma aresta aleatoria
  const getRandomEdge = () =>
    Drawable.drawableInstances[Edge.name][
      Math.floor(Math.random() * numberOfVertices)
    ]

  // Gerar carros
  for (let carId = 0; carId < numberOfCars; carId++) {
    // Pega uma aresta
    const edge = getRandomEdge()

    // Pega um deslocamento
    const displacement = edge.mapDistance * Math.random()

    new Car(
      carId,
      edge,
      edge.source.x + sin(edge.angle + 90) * displacement,
      edge.source.y + cos(edge.angle + 90) * displacement
    )
  }

  // Gerar clientes
  for (let clientId = 0; clientId < numberOfClients; clientId++) {
    new Client(clientId, randomCoords(), randomCoords())
  }
}
