import Drawable from '../../classes/Drawables/Drawable'
import Vertex from '../../classes/Drawables/Vertex'
import Edge from '../../classes/Drawables/Edge'
import Configuration from '../../configuration/Configuration'
import Random from '../../classes/Random'
import { generateRandomCars, generateRandomClients } from './generateRandomMap'
import { cos, sin } from '../trigonometry'

const defaultLaneSpeed = () =>
  60 * Configuration.getInstance().general.pixelsPerKilometer
const slowLaneSpeed = () =>
  40 * Configuration.getInstance().general.pixelsPerKilometer
const fastLaneSpeed = () =>
  80 * Configuration.getInstance().general.pixelsPerKilometer

// True mod
function mod(number, modBase) {
  return ((number % modBase) + modBase) % modBase
}

// Coordinate content types
const vertexContent = 'vertex'

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

  static reset() {
    this.instances = {}
    this.leftmost = null
    this.rightmost = null
    this.bottommost = null
    this.uppermost = null
  }

  constructor(x, y) {
    if (isNaN(x) || isNaN(y))
      throw new Error(`Invalid coordinates x: ${x}, y: ${y}`)

    this.x = x
    this.y = y
    this.id = Coordinate.idGenerator++
    this.content = null
    this.vertex = null
    Coordinate.exploitableCoordinates[this.id] = this
    Coordinate.instances[this.id] = this

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
    return Coordinate.at(this.x + x, this.y + y)
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

  // Gets all blocks which were already instantiated that share this coordinate as one of it's vertices
  getBlocks() {
    const blocks = []

    const maybeAdd = (x, y) => {
      if (
        Block.hasBlock(
          this.x + x - Block.originCoordinate.x,
          this.y + y - Block.originCoordinate.y
        )
      )
        blocks.push(
          Block.at(
            this.x + x - Block.originCoordinate.x,
            this.y + y - Block.originCoordinate.y
          )
        )
    }

    maybeAdd(0, 0)
    maybeAdd(0, -1)
    maybeAdd(-1, 0)
    maybeAdd(-1, -1)

    return blocks
  }

  // Sets speed for lane that passes along this coordinate
  setLaneSpeed(
    newSpeed,
    lanesLeft,
    direction = Random.sample(['horizontal', 'vertical'])
  ) {
    // If no vertex or no more lanes left, stop
    if (this.vertex == null || lanesLeft.value <= 0) return

    // Get neighbors along this direction
    const neighbors = {
      horizontal: [
        Coordinate.at(this.x - 1, this.y),
        Coordinate.at(this.x + 1, this.y),
      ],
      vertical: [
        Coordinate.at(this.x, this.y - 1),
        Coordinate.at(this.x, this.y + 1),
      ],
    }[direction]

    // For each of these neighbors
    // Discard those without a vertex
    for (const neighbor of neighbors.filter(
      (neighbor) => neighbor.vertex != null
    )) {
      const lanes = []

      // Find lanes between this coord and this neighbor
      for (const lane of Object.values(neighbor.getVertex().sourceOf)) {
        // Check if this coord is this lane's target and if it's speed is not yet the target speed
        if (
          lane.destination.id == this.getVertex().id &&
          lane.mapSpeed != newSpeed
        )
          lanes.push(lane)
      }

      for (const lane of Object.values(neighbor.getVertex().destinationOf)) {
        // Check if this coord is this lane's origin and if it's speed is still the default value
        if (
          lane.source.id == this.getVertex().id &&
          lane.mapSpeed == defaultLaneSpeed()
        )
          lanes.push(lane)
      }

      // If no lanes between this coord and the neighbor, ignore it
      if (lanes.length == 0) continue

      // Set the lanes' speed
      for (const lane of lanes) {
        // Check for lane run out
        if (lanesLeft.value-- <= 0) return

        lane.mapSpeed = newSpeed
      }

      // Propagate
      neighbor.setLaneSpeed(newSpeed, lanesLeft, direction)

      if (lanesLeft.value <= 0) return
    }
  }
}

class Block {
  static instances = {}

  // Blocks that may still have empty neighbors
  static availableBlocks = {}

  // Coordinate of top-left vertex of block 0,0
  static originCoordinate = { x: 0, y: 0 }

  static reset() {
    this.instances = {}
    this.availableBlocks = {}
  }

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
  initialClients = 15,
  blocksAngle = 0,
  vertexOmitChance = 20,
  edgeOmitChance = 25,
  lowSpeedLaneProportion = 5,
  highSpeedLaneProportion = 5
) {
  // Reset everything
  Coordinate.reset()
  Block.reset()

  // Update config
  Block.originCoordinate = {
    x: Random.rangeInt(0, 2),
    y: Random.rangeInt(0, 2),
  }

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
  generateStreetsForBlocks(vertexOmitChance, edgeOmitChance)

  // Alter lanes' speeds
  alterLanesSpeeds(lowSpeedLaneProportion, highSpeedLaneProportion)

  // Create cars
  generateRandomCars(numberOfCars)

  // Padding for valid client positions, in pixels
  const padding = 30

  // Create clients
  generateRandomClients(
    initialClients,
    Coordinate.leftmost.asMapCoordinates().x - padding,
    Coordinate.rightmost.asMapCoordinates().x + padding,
    Coordinate.uppermost.asMapCoordinates().y - padding,
    Coordinate.bottommost.asMapCoordinates().y + padding
  )
}

function streetToken(originId, targetId) {
  return { origin: originId, target: targetId }
}

function generateStreetsForBlocks(vertexOmitChance, edgeOmitChance) {
  // A graph to simulate the streets
  const streetGraph = {}
  const streetVertices = []
  const streets = []

  // Create street between 2 coordinates
  function addStreet(coordinateA, coordinateB) {
    streets.push(streetToken(coordinateA.id, coordinateB.id))

    if (streetGraph[coordinateA.id] != undefined)
      streetGraph[coordinateA.id].push(coordinateB)
    else streetGraph[coordinateA.id] = [coordinateB]
  }

  for (const block of Object.values(Block.instances)) {
    const blockCoordinates = block.getCoordinates()

    for (let i = 0; i < 4; i++) {
      streetVertices.push(blockCoordinates[i])
      addStreet(blockCoordinates[i], blockCoordinates[mod(i + 1, 4)])
      addStreet(blockCoordinates[i], blockCoordinates[mod(i - 1, 4)])
    }
  }

  // Ensure graph is valid
  if (streetGraphValid(streetGraph) == false) {
    console.log('Street graph:', streetGraph)
    throw new Error('Error generating initial street graph')
  }

  // Shuffle lists
  Random.shuffle(streetVertices)
  Random.shuffle(streets)

  // Randomly remove vertices
  // Ensure graph always stays connected for each vertex
  const skipVertices = new Set()

  // Initialize vertex iterator
  let iterator = 0

  // Coin tosses
  let coinTosses = 0

  // Checks if removing this coordinate results in a whole block being removed
  function sustainsWholeBlock(coordinate) {
    // For each of this coordinate's blocks
    for (const block of coordinate.getBlocks()) {
      // Count the amount of coordinates this block has that are already skipped
      let skippedCoords = 0

      for (const coord of block.getCoordinates())
        if (skipVertices.has(coord.id)) skippedCoords++

      // If 3 vertices are already skipped, then this vertex must be it's last
      if (skippedCoords >= 3) return true
    }

    return false
  }

  // Toss a coin for each vertex
  // Stop if only 2 vertices are left
  while (
    coinTosses++ < streetVertices.length &&
    skipVertices.size + 2 < streetVertices.length
  ) {
    // Toss the coin
    if (Random.coinToss(vertexOmitChance / 100) == false) continue

    // Remove a vertex
    while (true) {
      // Next vertex to remove
      const targetVertex = streetVertices[iterator++]

      // If removing this coordinate results in the removal of a whole block, skip it
      if (sustainsWholeBlock(targetVertex) == false) {
        // Remove it
        skipVertices.add(targetVertex.id)

        // Ensure graph remains connected
        if (streetGraphValid(streetGraph, skipVertices)) break

        // Cannot remove this vertex
        skipVertices.delete(targetVertex.id)
      }

      // Validate iterator
      if (iterator >= streetVertices.length) break
    }

    // Validate iterator
    if (iterator >= streetVertices.length) break
  }

  // Randomly remove streets
  // Ensure graph always stays connected for each vertex
  const skipStreets = new Set()

  // Effectively create streets
  let streetId = 0

  // Initialize vertex iterator
  iterator = 0

  // Coin tosses
  coinTosses = 0

  // Toss a coin for each street
  while (coinTosses++ < streets.length) {
    // Toss the coin
    if (Random.coinToss(edgeOmitChance / 100) == false) continue

    // Remove a street
    while (true) {
      // Next street to remove
      const targetStreet = streets[iterator++]
      const streetToken = JSON.stringify(targetStreet)

      // Remove it
      skipStreets.add(streetToken)

      // Ensure graph remains connected
      if (streetGraphValid(streetGraph, skipVertices, skipStreets)) break

      // Cannot remove this street
      skipStreets.delete(streetToken)

      // Validate iterator
      if (iterator >= streets.length) break
    }

    // Validate iterator
    if (iterator >= streets.length) break
  }

  for (const street of streets) {
    // Ensure none of it's components are skipped
    if (
      skipStreets.has(JSON.stringify(street)) ||
      skipVertices.has(street.origin) ||
      skipVertices.has(street.target)
    )
      continue

    const origin = Coordinate.instances[street.origin]
    const target = Coordinate.instances[street.target]

    new Edge(streetId++, origin.getVertex(), target.getVertex(), {
      mapSpeed: defaultLaneSpeed(),
    })
  }
}

// Returns true if, for any given vertex, all other vertices can be reached via some route
// Returns false otherwise
function streetGraphValid(
  streetGraph,
  skipVertices = new Set(),
  skipStreets = new Set()
) {
  // How many vertices need to be counted each time
  const targetVertexCount = Object.keys(streetGraph).length - skipVertices.size

  // Nodes that we know are connected
  // Whenever a node in this set is encountered, we know there is a path to all other nodes, so we don't have to check any other nodes
  // DFS will return -1 when it encounters a golden node
  const goldenNodes = new Set()

  // For each vertex
  for (let nodeId of Object.keys(streetGraph)) {
    nodeId = JSON.parse(nodeId)

    // Check skip
    if (skipVertices.has(nodeId)) continue

    const foundNodes = depthFirstSearch(
      JSON.parse(nodeId),
      goldenNodes,
      streetGraph,
      skipVertices,
      skipStreets
    )

    if (foundNodes != targetVertexCount && foundNodes != -1) return false

    goldenNodes.add(nodeId)
  }

  return true
}

function depthFirstSearch(
  nodeId,
  goldenNodes,
  graph,
  skipNodes,
  skipEdges,
  visitedNodes = new Set()
) {
  // Check golden node
  if (goldenNodes.has(nodeId)) return -1

  // Check node skip
  if (skipNodes.has(nodeId) || visitedNodes.has(nodeId)) return 0

  visitedNodes.add(nodeId)

  let childrenSum = 0

  for (const childNode of graph[nodeId]) {
    // Check edge skip
    if (skipEdges.has(JSON.stringify(streetToken(nodeId, childNode.id))))
      continue

    const childResult = depthFirstSearch(
      childNode.id,
      goldenNodes,
      graph,
      skipNodes,
      skipEdges,
      visitedNodes
    )

    // Detect golden result
    if (childResult == -1) return -1

    childrenSum += childResult
  }

  return childrenSum + 1
}

function alterLanesSpeeds(lowSpeedLaneProportion, highSpeedLaneProportion) {
  // How many lanes to set low speed
  const lowSpeedLaneCount = {
    value: Math.floor(
      (Object.keys(Edge.instances).length * lowSpeedLaneProportion) / 100
    ),
  }

  // How many lanes to set high speed
  const highSpeedLaneCount = {
    value: Math.floor(
      (Object.keys(Edge.instances).length * highSpeedLaneProportion) / 100
    ),
  }

  // Get array of shuffled coord ids
  const shuffledCoordIds = Random.shuffle(Object.keys(Coordinate.instances))

  // Iterator of ids
  let idIterator = 0

  // Set low speeds
  while (lowSpeedLaneCount.value > 0 && idIterator < shuffledCoordIds.length) {
    const coordinate = Coordinate.instances[shuffledCoordIds[idIterator++]]
    coordinate.setLaneSpeed(slowLaneSpeed(), lowSpeedLaneCount)
  }

  // Reset iterator
  idIterator = 0

  // Re-shuffle ids
  Random.shuffle(shuffledCoordIds)

  // Set high speeds
  while (highSpeedLaneCount.value > 0 && idIterator < shuffledCoordIds.length) {
    const coordinate = Coordinate.instances[shuffledCoordIds[idIterator++]]
    coordinate.setLaneSpeed(fastLaneSpeed(), highSpeedLaneCount)
  }

  // Recalculate record speeds
  Edge.updateRecordEdges()
}
