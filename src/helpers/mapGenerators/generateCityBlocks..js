import Drawable from '../../classes/Drawables/Drawable'
import Vertex from '../../classes/Drawables/Vertex'
import Edge from '../../classes/Drawables/Edge'
import appConfig from '../../configuration/appConfig'
import Random from '../../classes/Random'
import { generateRandomCars, generateRandomClients } from './generateRandomMap'
import { cos, sin } from '../trigonometry'

const { pixelsPerKilometer } = appConfig

// True mod
function mod(number, modBase) {
  return ((number % modBase) + modBase) % modBase
}

// Create edge between both vertices on both directions
function createStreetBetween(vertex1, vertex2) {
  const id = Object.entries(Drawable.drawableInstances[Edge.name] ?? {}).length

  // console.log('Creating street with id ' + id)

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

  // Rotation of blocks
  static blocksAngle = 0

  static idGenerator = 0

  static leftmost = null
  static rightmost = null
  static bottommost = null
  static uppermost = null

  // Coordinates that might be used to create a new block
  static exploitableCoordinates = {}

  constructor(x, y) {
    if (isNaN(x) || isNaN(y))
      throw new Error(`Invalid coordinates x: ${x}, y: ${y}`)

    this.x = x
    this.y = y
    this.id = Coordinate.idGenerator++
    this.content = null
    this.vertex = null
    Coordinate.exploitableCoordinates[this.id] = this

    if (Coordinate.leftmost == null || this.x < Coordinate.leftmost.x)
      Coordinate.leftmost = this
    if (Coordinate.rightmost == null || this.x > Coordinate.rightmost.x)
      Coordinate.rightmost = this
    if (Coordinate.bottommost == null || this.y > Coordinate.bottommost.y)
      Coordinate.bottommost = this
    if (Coordinate.uppermost == null || this.y < Coordinate.uppermost.y)
      Coordinate.uppermost = this
  }

  // Whether this coordinate is available to be used
  isFree() {
    return this.content == null
  }

  // Get map coordinates equivalent to this grid's coordinates
  asMapCoordinates() {
    return {
      x:
        (this.x * cos(Coordinate.blocksAngle) -
          this.y * sin(Coordinate.blocksAngle)) *
        Coordinate.blockSize,
      y:
        (this.x * sin(Coordinate.blocksAngle) +
          this.y * cos(Coordinate.blocksAngle)) *
        Coordinate.blockSize,
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
    // try {
    return Coordinate.at(this.x + x, this.y + y)
    // } catch {
    //   console.log('shit')
    //   console.log(this.x, this.y)
    //   console.log(x, y)
    // }
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
  // Get random block position index
  const initialBlockPositionIndex = Math.floor(Math.random() * 4)
  let blockPositionOffset = 0

  // Detect which streets will need to be added
  const streetsToAdd = {}

  const registerStreetAdd = (coord1, coord2) => {
    const [a, b] = [coord1.id, coord2.id].sort()

    if (coord1.id === coord2.id) {
      console.log(' oh shit')
      console.log(coord1)
      console.log(coord2)
      throw new Error(
        'Trying to register a street between the same coordinates'
      )
    }

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
      mod(initialBlockPositionIndex + blockPositionOffset++, 4)
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

  return true
}

// Generate city blocks based on an imaginary grid
export default function generateCityBlocks(
  numberOfBlocks = 10,
  blockSize = window.innerWidth / 5,
  numberOfCars = 6,
  numberOfClients = 15,
  blocksAngle = 0
) {
  // Update config
  Coordinate.blockSize = blockSize
  Coordinate.blocksAngle = blocksAngle

  // Create first block
  createCityBlock(Coordinate.at(0, 0))

  // Count of blocks created
  let blocksCreated = 1

  // While there are more blocks to create
  while (blocksCreated < numberOfBlocks) {
    // If no more coordinates are left to exploit, panic
    if (Object.keys(Coordinate.exploitableCoordinates).length == 0)
      throw new Error('No more coordinates were left to generate blocks from')

    // Pick a random coordinate that might be suitable for a new block
    const mainCoordinates = Random.sample(Coordinate.exploitableCoordinates)

    if (createCityBlock(mainCoordinates)) blocksCreated++
  }

  // Create cars
  generateRandomCars(numberOfCars)

  // Padding for valid client positions, in pixels
  const padding = 30

  console.log(Coordinate.leftmost.asMapCoordinates())
  console.log(Coordinate.rightmost.asMapCoordinates())

  // Create clients
  generateRandomClients(
    numberOfClients,
    Coordinate.leftmost.asMapCoordinates().x - padding,
    Coordinate.rightmost.asMapCoordinates().x + padding,
    Coordinate.uppermost.asMapCoordinates().y - padding,
    Coordinate.bottommost.asMapCoordinates().y + padding
  )
}
