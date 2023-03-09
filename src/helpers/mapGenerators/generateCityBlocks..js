import Drawable from '../../classes/Drawables/Drawable'
import Vertex from '../../classes/Drawables/Vertex'
import Edge from '../../classes/Drawables/Edge'
import appConfig from '../../configuration/appConfig'

const { pixelsPerKilometer } = appConfig

// Create edge between both vertices on both directions
function createStreetBetween(vertex1, vertex2) {
  const id = Object.entries(Drawable.drawableInstances[Edge.name] ?? {}).length

  console.log('Creating street with id ' + id)

  new Edge(id, vertex1, vertex2, { mapSpeed: 60 * pixelsPerKilometer })
  new Edge(id + 1, vertex2, vertex1, { mapSpeed: 60 * pixelsPerKilometer })
}

class Coordinate {
  static #instances = {}

  // Block size to be used in coordinate calculation
  static blockSize = 50

  static idGenerator = 0

  constructor(x, y) {
    this.x = x
    this.y = y
    this.id = this.idGenerator++
    this.content = null
    this.vertex = null
  }

  // Whether this coordinate is available to be used
  isFree() {
    return this.content == null
  }

  // Get map coordinates equivalent to this grid's coordinates
  asMapCoordinates() {
    return { x: this.x * Coordinate.blockSize, y: this.y * Coordinate.blockSize }
  }

  // Get (generate if necessary) vertex at this coordinates
  getVertex() {
    if (this.vertex == null) {
      const { x: mapX, y: mapY } = this.asMapCoordinates()
      this.vertex = new Vertex(this.id, mapX, mapY, true)
    }

    return this.vertex
  }

  right() {
    return Coordinate.at(this.x + 1, this.y)
  }

  bottom() {
    return Coordinate.at(this.x, this.y + 1)
  }

  left() {
    return Coordinate.at(this.x - 1, this.y)
  }

  top() {
    return Coordinate.at(this.x, this.y - 1)
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

// Creates a city block with the given coordinate as one of it's vertices
// If the given coordinate is not free, does nothing
// If no block is possible, sets the coordinate as dead
function createCityBlock(mainCoordinates) {
  if (mainCoordinates.isFree() == false) return

  // Get other coordinates
  const horizontalCoordinates = mainCoordinates.right()
  const verticalCoordinates = mainCoordinates.top()
  const crossCoordinates = horizontalCoordinates.top()

  console.log(mainCoordinates.getVertex())
  console.log(horizontalCoordinates.getVertex())
  console.log(verticalCoordinates.getVertex())
  console.log(crossCoordinates.getVertex())

  // Add streets for each vertex pair
  createStreetBetween(
    mainCoordinates.getVertex(),
    horizontalCoordinates.getVertex()
  )
  createStreetBetween(
    mainCoordinates.getVertex(),
    verticalCoordinates.getVertex()
  )
  createStreetBetween(
    crossCoordinates.getVertex(),
    horizontalCoordinates.getVertex()
  )
  createStreetBetween(
    crossCoordinates.getVertex(),
    verticalCoordinates.getVertex()
  )
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
