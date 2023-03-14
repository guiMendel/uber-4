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

function stringify(x, y) {
  return `${x},${y}`
}

class Coordinate {
  static instances = {}

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

    if (
      Coordinate.leftmost == null ||
      this.asMapCoordinates().x < Coordinate.leftmost.asMapCoordinates().x
    )
      Coordinate.leftmost = this
    if (
      Coordinate.rightmost == null ||
      this.asMapCoordinates().x > Coordinate.rightmost.asMapCoordinates().x
    )
      Coordinate.rightmost = this
    if (
      Coordinate.bottommost == null ||
      this.asMapCoordinates().y > Coordinate.bottommost.asMapCoordinates().y
    )
      Coordinate.bottommost = this
    if (
      Coordinate.uppermost == null ||
      this.asMapCoordinates().y < Coordinate.uppermost.asMapCoordinates().y
    )
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
    if (this.instances[stringify(x, y)] == undefined) {
      this.instances[stringify(x, y)] = new Coordinate(x, y)
    }

    return this.instances[stringify(x, y)]
  }

  asString() {
    return stringify(this.x, this.y)
  }
}

class Block {
  static instances = {}

  // Blocks that may still have empty neighbors
  static availableBlocks = {}

  // Coordinate of top-left vertex of block 0,0
  static originCoordinate = { x: 0, y: 0 }

  constructor(x, y) {
    if (isNaN(x) || isNaN(y))
      throw new Error(`Invalid coordinates x: ${x}, y: ${y}`)

    this.x = x
    this.y = y
    Block.availableBlocks[this.id] = this
    Block.instances[this.id] = this
  }

  // Get top-left, top-right, bottom-right, bottom-left vertices of this block as coordinates
  getCoordinates() {
    return [
      Coordinate.at(
        this.x + Block.originCoordinate.x,
        this.y + Block.originCoordinate.y
      ),
      Coordinate.at(
        this.x + Block.originCoordinate.x + 1,
        this.y + Block.originCoordinate.y
      ),
      Coordinate.at(
        this.x + Block.originCoordinate.x + 1,
        this.y + Block.originCoordinate.y + 1
      ),
      Coordinate.at(
        this.x + Block.originCoordinate.x,
        this.y + Block.originCoordinate.y + 1
      ),
    ]
  }

  // Checks whether there is a block at this position
  static hasBlock(x, y) {
    return this.instances[stringify(x, y)] != undefined
  }

  static at(x, y) {
    if (this.hasBlock(x, y) == false) {
      this.instances[stringify(x, y)] = new Block(x, y)
    }

    return this.instances[stringify(x, y)]
  }

  get id() {
    return stringify(this.x, this.y)
  }
}

// Creates a city block with the given coordinate as one of it's vertices
// If the given coordinate is not free, does nothing
// If no block is possible, sets the coordinate as dead
// Returns true if a block was created, false otherwise
function createNeighbor(block) {
  // Get random block position index
  const initialBlockPositionIndex = Random.rangeInt(0, 8)
  let blockPositionOffset = 0

  // Maps neighbor index to it's position
  const getNeighbor = (index) => {
    let x = 0
    let y = 0

    if (index == 0 || index >= 6) x = -1
    else if (index != 1 && index != 5) x = 1

    if (index <= 2) y = -1
    else if (index != 3 && index != 7) y = 1

    return {
      x: block.x + x,
      y: block.y + y,
    }
  }

  while (
    Block.hasBlock(
      getNeighbor(mod(initialBlockPositionIndex + blockPositionOffset, 8))
    )
  ) {
    // Detect case where all possible block positions were checked and none of them were possible
    if (++blockPositionOffset >= 8) {
      // Remove this block from the possible block object
      delete Block.availableBlocks[block.id]

      return false
    }
  }

  // Add block
  const blockPosition = getNeighbor(
    mod(initialBlockPositionIndex + blockPositionOffset, 8)
  )
  new Block(blockPosition.x, blockPosition.y)

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
  Block.originCoordinate = {
    x: Random.rangeInt(0, 2),
    y: Random.rangeInt(0, 2),
  }

  console.log('Block.originCoordinate', Block.originCoordinate)

  Coordinate.blockSize = blockSize
  Coordinate.blocksAngle = blocksAngle

  // Create first block
  // createNeighbor(Coordinate.at(0, 0))
  new Block(0, 0)

  // Count of blocks created
  let blocksCreated = 1

  // While there are more blocks to create
  while (blocksCreated < numberOfBlocks) {
    // If no more blocks are left to exploit, panic
    if (Object.keys(Block.availableBlocks).length == 0)
      throw new Error(
        'No more blocks were left to generate neighbor blocks from'
      )
    // if (Object.keys(Coordinate.exploitableCoordinates).length == 0)
    //   throw new Error('No more coordinates were left to generate blocks from')

    // Pick a random block that might be suitable
    const block = Random.sample(Block.availableBlocks)

    if (createNeighbor(block)) blocksCreated++
  }

  // Generate vertices and streets for these blocks
  generateStreetsForBlocks()

  // Create cars
  generateRandomCars(numberOfCars)

  // Padding for valid client positions, in pixels
  const padding = 30

  // Create clients
  generateRandomClients(
    numberOfClients,
    Coordinate.leftmost.asMapCoordinates().x - padding,
    Coordinate.rightmost.asMapCoordinates().x + padding,
    Coordinate.uppermost.asMapCoordinates().y - padding,
    Coordinate.bottommost.asMapCoordinates().y + padding
  )
}

function generateStreetsForBlocks() {
  // A graph to simulate the streets
  const streetGraph = {}
  const streetVertices = []
  const streets = []

  // Create street between 2 coordinates
  function addStreet(coordinateA, coordinateB) {
    streets.push({ origin: coordinateA, target: coordinateB })

    if (streetGraph[coordinateA.asString()] != undefined)
      streetGraph[coordinateA.asString()].push(coordinateB)
    else streetGraph[coordinateA.asString()] = [coordinateB]
  }

  for (const block of Object.values(Block.instances)) {
    const blockCoordinates = block.getCoordinates()

    for (let i = 0; i < 4; i++) {
      streetVertices.push(blockCoordinates[i].asString())
      addStreet(blockCoordinates[i], blockCoordinates[mod(i + 1, 4)])
      addStreet(blockCoordinates[i], blockCoordinates[mod(i - 1, 4)])
    }
  }

  // Shuffle lists
  Random.shuffle(streetVertices)
  Random.shuffle(streets)

  // Randomly remove vertices
  // Ensure graph always stays connected for each vertex

  // Randomly remove streets
  // Ensure graph always stays connected for each vertex

  // Effectively create streets
  let streetId = 0

  for (const street of streets)
    new Edge(streetId++, street.origin.getVertex(), street.target.getVertex(), {
      mapSpeed: 60 * pixelsPerKilometer,
    })
}
