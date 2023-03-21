const defaultStreetWidth = 25

export default class Configuration {
  static instance = null

  static getInstance() {
    if (this.instance == null) this.instance = new Configuration()
    return this.instance
  }

  // Configuration parameters
  static configurationParams = {
    general: {
      maxFramesPerSecond: {
        default: 60,
        min: 20,
        max: 120,
        description: 'Max number of frames per second',
      },

      timescale: {
        default: 0.04,
        min: 1 / (60 * 60),
        max: 0.3,
        description:
          'How many hours of simulation take one second of real time',
      },

      pixelsPerKilometer: {
        default: 128,
        min: 32,
        max: 512,
        description: 'How many pixels there are in a kilometer',
      },

      clientWalkSpeed: {
        default: 4.7,
        min: 1,
        max: 10,
        description: 'Speed a client walks, in km/h',
      },

      // Em qual ordem cada classe sera desenhada. As primeiras ficam embaixo
      drawOrder: {
        constant: [
          'Vertex',
          'Edge',
          'ArrowIndicators',
          'Car',
          'Client',
          'ClientCreator',
          'StreetCreator',
          'CarCreator',
          'Debug',
        ],
      },

      // O tempo (segundos) que as mensagens de erro ficam em tela
      errorMessageDuration: { constant: 11 },

      // Quantas iteracoes, no minimo, realizar a expansao do A* de cada carro analizado
      pathExpansionIterations: { constant: 20 },

      // Quantas iteracoes somar ao numero de iteracoes sempre que um carro descobrir um novo melhor caminho
      newBestPathReward: { constant: 4 },

      // Quantos dos melhores nos considerar quando for calcular o tempo de entrega no-destino de cada carro
      countOfNodesToConsider: { constant: 7 },

      // Alcance em que ocorre o snap para vertices ja existentes, quando criando novas ruas
      newStreetVertexSnapRange: { constant: 20 },

      // Distancia maxima permitida entre o mouse e uma aresta em que vai ser colocado um novo carro
      maxCarSnapDistance: { constant: 100 },

      // Velocidade do movimento automatico da camera, em pixel/s
      cameraPanSpeed: { constant: 100 },
    },

    theme: {
      //=== GERAL
      overall: { isTitle: true },

      mapBackground: {
        default: '#cccccc',
        description: "Color of the map's background",
      },

      // Velocidade geral de animacoes simples, em segundos
      generalAnimationSpeed: { constant: 0.05 },

      highlightColor: {
        default: '#0287f4',
        description: 'Color of highlight markers',
      },

      eraseColor: {
        default: '#f74a33',
        description: 'Color of elements highlighted for erasing',
      },

      streets: { isTitle: true },

      // A cor das ruas
      // Slowest sera quando a rua tiver a menor velocidade possivel
      slowestStreetColor: {
        default: '#efefef',
        description: 'Color of the slowest street in the map',
      },

      // Highest sera quando a rua tiver a maior velocidade possivel
      fastestStreetColor: {
        default: '#b3c7fc',
        description: 'Color of the fastest street in the map',
      },

      // A largura das ruas, em pixels
      streetWidth: {
        default: defaultStreetWidth,
        min: 3,
        max: 150,
        description: 'Width of street in pixels',
      },

      streetArrows: { isTitle: true },

      streetArrowColor: {
        default: '#ffffff',
        description: 'Color of street arrows',
      },

      streetArrowHeight: {
        default: 10,
        min: 2,
        max: 50,
        description: 'Height of the street arrows triangles',
      },

      streetArrowWidth: {
        default: defaultStreetWidth / 5,
        min: 2,
        max: 50,
        description: 'Width of the street arrows',
      },

      streetArrowInterval: {
        default: 60,
        min: 0,
        max: 200,
        description: 'Space between each of the street arrows',
      },

      routesAndClients: { isTitle: true },

      clientHoverGrow: {
        default: 1.3,
        min: 1,
        max: 3,
        description: 'How much the client picture grows when hovered',
      },

      selectedClientRadius: {
        default: 0.8 * defaultStreetWidth,
        min: 5,
        max: 50,
        description: 'Radius of highlight of selected client',
      },

      clientDestinationRadius: {
        default: 0.5 * defaultStreetWidth,
        min: 5,
        max: 50,
        description: 'Radius of route destination',
      },

      clientWidth: {
        default: defaultStreetWidth,
        min: 5,
        max: 50,
        description: 'Width of client pictures',
      },

      carWidth: {
        default: 1.1 * defaultStreetWidth,
        min: 5,
        max: 50,
        description: 'Width of car pictures',
      },

      selectedRouteHighlight: {
        default: '#b4fca9',
        description:
          'Color of route visualization from the rendez-vous point to the destination',
      },

      selectedRouteHighlightBeforeRdv: {
        default: '#f1f783',
        description:
          'Color of route visualization from the car position to the rendez-vous point',
      },

      clientWalkPathWidth: {
        default: defaultStreetWidth / 3,
        min: 0.2,
        max: 20,
        description: 'Width of the client walk route fretted lines',
      },

      clientWalkPathLineSize: {
        default: 15,
        min: 0.2,
        max: 100,
        description: 'Length of the client walk route fretted lines',
      },

      // O espaco entre as linhas do trastejado
      clientWalkPathLineGap: {
        default: 15,
        min: 0.2,
        max: 100,
        description:
          'Length of the gap between client walk path route fretted lines',
      },
    },
  }

  constructor() {
    for (const [configurationType, configurationParams] of Object.entries(
      Configuration.configurationParams
    )) {
      // Add this config
      this[configurationType] = {}

      // Read from memory if stored
      const storedValues = localStorage.getItem(
        `configuration-${configurationType}`
      )

      if (storedValues != null && storedValues != 'undefined')
        this[configurationType] = JSON.parse(storedValues)

      // For each of it's params
      for (const [paramName, paramValue] of Object.entries(
        configurationParams
      )) {
        // Ignore if already loaded from memory
        // Ignore titles
        if (
          paramValue.isTitle ||
          this[configurationType][paramName] != undefined
        )
          continue

        // Store if constant
        if (paramValue.constant != undefined) {
          this[configurationType][paramName] = paramValue.constant
          continue
        }

        // Use default value
        if (paramValue.default == undefined)
          throw new Error(
            'A default or constant value is required, but ' +
              paramName +
              " didn't have one"
          )

        this[configurationType][paramName] = paramValue.default
      }
    }

    console.log('configs:', this)
  }
}
