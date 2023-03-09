export default {
  'city-blocks': {
    numberOfBlocks: { type: 'number', min: 1, max: 30 },
    numberOfCars: { type: 'number', min: 0, max: 15 },
    numberOfClients: { type: 'number', min: 0, max: 40 },
  },
  random: {
    numberOfVertices: { type: 'number', min: 2, max: 30 },
    numberOfCars: { type: 'number', min: 0, max: 15 },
    numberOfClients: { type: 'number', min: 0, max: 40 },
    mapWidth: {
      type: 'number',
      min: 500,
      max: window.innerWidth * 3,
      unit: 'px',
    },
    mapHeight: {
      type: 'number',
      min: 500,
      max: window.innerHeight * 3,
      unit: 'px',
    },
    minDistanceBetweenVertices: {
      type: 'number',
      min: 0,
      max: 400,
      unit: 'px',
    },
  },
  blank: {},
}
