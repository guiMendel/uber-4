import Client from '../../classes/Drawables/Client'
import Car from '../../classes/Drawables/Car'
import Drawable from '../../classes/Drawables/Drawable'
import Edge from '../../classes/Drawables/Edge'
import Vertex from '../../classes/Drawables/Vertex'
import Configuration from '../../configuration/Configuration'
import { sin, cos } from '../trigonometry'
import { getDistance } from '../vectorDistance'
import Random from '../../classes/Random'

export function generateRandomStreets(
  numberOfVertices = 20,
  mapWidth = window.innerWidth * 2,
  mapHeight = window.innerHeight * 2,
  minDistanceBetweenVertices = 200
) {
  if (numberOfVertices <= 1) throw new Error('Requires at least 2 vertices')

  // Helper para gerar coordenadas aleatorias centralizadas em 0,0
  const randomCoords = (distantFromVertices = true) => {
    const getCoords = () => ({
      x: Random.rangeFloat(-mapWidth / 2, mapWidth / 2),
      y: Random.rangeFloat(-mapHeight / 2, mapHeight / 2),
    })

    // Gera coordenadas
    let newCoords = getCoords()

    // Verifica se as coordenadas estao boas
    if (distantFromVertices) {
      let triesLeft = 30
      while (--triesLeft > 0) {
        let canStop = true

        // For each vertex
        for (const vertex of Object.values(Vertex.instances)) {
          // If it's too close
          if (getDistance(vertex, newCoords) < minDistanceBetweenVertices) {
            // Cannot stop trying
            canStop = false
            break
          }
        }

        // If is good, stop
        if (canStop) break
        newCoords = getCoords()
      }
    }

    return newCoords
  }

  // Gerar vertices
  for (let vertexId = 0; vertexId < numberOfVertices; vertexId++) {
    const newCoords = randomCoords()
    new Vertex(vertexId, newCoords.x, newCoords.y, true)
  }

  // Helpers para pegar vertice aleatorio
  const randomVertexId = () => Random.rangeInt(0, numberOfVertices)
  const randomVertexIdExcept = (exceptId = null) => {
    const vertexId = randomVertexId()
    // Se gerou o mesmo id de except, tente outra vez
    return exceptId == vertexId ? randomVertexIdExcept(exceptId) : vertexId
  }

  // Gera uma velocidade aleatoria
  const randomSpeed = () => {
    const realSpeedRange = [30, 100]

    const { pixelsPerKilometer } = Configuration.getInstance().general

    return Random.rangeFloat(
      realSpeedRange[0] * pixelsPerKilometer,
      realSpeedRange[1] * pixelsPerKilometer
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

  // Gerar arestas para cada vertice
  for (let edgeId = 0; edgeId < numberOfVertices; edgeId++) {
    new Edge(
      edgeId + numberOfVertices,
      Drawable.drawableInstances[Vertex.name][edgeId],
      Drawable.drawableInstances[Vertex.name][randomVertexIdExcept(edgeId)],
      {
        mapSpeed: randomSpeed(),
      }
    )
  }
}

export function generateRandomCars(numberOfCars = 4) {
  // Gerar carros
  for (let carId = 0; carId < numberOfCars; carId++) {
    // Pega uma aresta
    const edge = Random.sample(Edge.instances)

    // Pega um deslocamento
    const displacement = Random.rangeFloat(0, edge.mapDistance)

    console.log('Generating car for edge ', edge)

    new Car(
      carId,
      edge,
      edge.source.x + sin(edge.angle + 90) * displacement,
      edge.source.y + cos(edge.angle + 90) * displacement
    )
  }
}

export function generateRandomClients(
  initialClients = 10,
  minX = -window.innerWidth,
  maxX = window.innerWidth,
  minY = -window.innerHeight,
  maxY = window.innerHeight
) {
  const randomCoords = () => ({
    x: Random.rangeFloat(minX, maxX),
    y: Random.rangeFloat(minY, maxY),
  })

  // Gerar clientes
  for (let clientId = 0; clientId < initialClients; clientId++) {
    new Client(clientId, randomCoords(), randomCoords())
  }
}

// Gera grafos e arestas aleatorios para fins de teste
export default function generateRandomMap(
  numberOfVertices = 20,
  numberOfCars = 4,
  initialClients = 10,
  mapWidth = window.innerWidth * 2,
  mapHeight = window.innerHeight * 2,
  minDistanceBetweenVertices = 200
) {
  generateRandomStreets(
    numberOfVertices,
    mapWidth,
    mapHeight,
    minDistanceBetweenVertices
  )

  generateRandomCars(numberOfCars)

  generateRandomClients(
    initialClients,
    -mapWidth / 2,
    mapWidth / 2,
    -mapHeight / 2,
    mapHeight / 2
  )
}
