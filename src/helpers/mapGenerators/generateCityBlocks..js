import Drawable from '../../classes/Drawables/Drawable'
import Vertex from '../../classes/Drawables/Vertex'
import Edge from '../../classes/Drawables/Edge'
import appConfig from '../../configuration/appConfig'

const { pixelsPerKilometer } = appConfig

// True mod
function mod(number, modBase) {
  return ((number % modBase) + modBase) % modBase
}

// Create edge between both vertices on both directions
function createStreetBetween(vertex1, vertex2) {
  const id = Object.entries(Drawable.drawableInstances[Edge.name] ?? {}).length

  console.log('Creating street with id ' + id)

  new Edge(id, vertex1, vertex2, { mapSpeed: 60 * pixelsPerKilometer })
  new Edge(id + 1, vertex2, vertex1, { mapSpeed: 60 * pixelsPerKilometer })
}

// Coordinate content types
const vertexContent = 'vertex'
const extendedEdgeContent = 'extended-edge'

class Coordinate {
  static #instances = {}

  // Block size to be used in coordinate calculation
  static blockSize = 50

  static idGenerator = 0

  // Coordinates that might be used to create a new block
  static exploitableCoordinates = {}

  constructor(x, y) {
    this.x = x
    this.y = y
    this.id = Coordinate.idGenerator++
    this.content = null
    this.vertex = null
    Coordinate.exploitableCoordinates[this.id] = this
  }

  // Whether this coordinate is available to be used
  isFree() {
    return this.content == null
  }

  // Get map coordinates equivalent to this grid's coordinates
  asMapCoordinates() {
    return {
      x: this.x * Coordinate.blockSize,
      y: this.y * Coordinate.blockSize,
    }
  }

  // Get (generate if necessary) vertex at this coordinates
  getVertex() {
    if (this.vertex == null) {
      const { x: mapX, y: mapY } = this.asMapCoordinates()
      this.vertex = new Vertex(this.id, mapX, mapY, true)
      this.content = vertexContent
    }

    return this.vertex
  }

  displace(x, y) {
    return Coordinate.at(this.x + x, this.y + y)
  }

  static at(x, y) {
    if (this.#instances[this.stringify(x, y)] == undefined) {
      this.#instances[this.stringify(x, y)] = new Coordinate(x, y)
    }

    return this.#instances[this.stringify(x, y)]
  }

  static stringify(x, y) {
    return `${x},${y}`
  }
}

// Gets coordinates for a block given it's main vertex and where to place it
// 0 places it bottom left, 1 top left, 2 top right, 3 bottom right
function getBlockFor(mainCoordinates, index) {
  const horizontalOffset = { 0: 1, 1: 1, 2: -1, 3: -1 }
  const verticalOffset = { 0: -1, 1: 1, 2: -1, 3: 1 }

  return [
    mainCoordinates,
    mainCoordinates.displace(horizontalOffset[index], 0),
    mainCoordinates.displace(horizontalOffset[index], verticalOffset[index]),
    mainCoordinates.displace(0, verticalOffset[index]),
  ]
}

// Creates a city block with the given coordinate as one of it's vertices
// If the given coordinate is not free, does nothing
// If no block is possible, sets the coordinate as dead
// Returns true if a block was created, false otherwise
function createCityBlock(mainCoordinates) {
  if (mainCoordinates.isFree() == false) return false

  // Get random block position index
  const initialBlockPositionIndex = Math.floor(Math.random() * 4)
  let blockPositionOffset = 0

  // Detect which streets will need to be added
  const streetsToAdd = {}

  const registerStreetAdd = (coord1, coord2) => {
    const [a, b] = [coord1.id, coord2.id].sort()

    console.log([coord1.id, coord2.id])

    streetsToAdd[JSON.stringify([a, b])] = [coord1, coord2]
  }

  while (Object.keys(streetsToAdd).length == 0) {
    // Detect case where all possible block positions were checked and none of them were possible
    if (blockPositionOffset >= 4) {
      // Remove this coordinates from the possible coordinates object
      delete Coordinate.exploitableCoordinates[mainCoordinates.id]

      return false
    }

    // Get coordinates for this block position
    const coordinates = getBlockFor(
      mainCoordinates,
      initialBlockPositionIndex + blockPositionOffset++
    )

    for (let i = 0; i < coordinates.length; i++) {
      const coordinate = coordinates[i]

      // If it's not free, skip it
      if (coordinate.isFree() == false) continue

      // Set up street add between it and it's neighbors
      registerStreetAdd(coordinate, coordinates[mod(i + 1, 4)])
      registerStreetAdd(coordinate, coordinates[mod(i - 1, 4)])
    }
  }

  // Add streets marked to be added
  for (const [coord1, coord2] of Object.values(streetsToAdd))
    createStreetBetween(coord1.getVertex(), coord2.getVertex())
}

// Generate city blocks based on an imaginary grid
export default function generateCityBlocks(
  numberOfBlocks = 10,
  blockSize = window.innerWidth / 5,
  numberOfCars = 6,
  numberOfClients = 15
) {
  // Update config
  Coordinate.blockSize = blockSize

  // Create first block
  createCityBlock(Coordinate.at(0, 0))
}
