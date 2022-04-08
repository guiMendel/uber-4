// Configuracoes gerais do aplicativo
export default {
  //=== GERAL

  // Numero maximo de frames por segundo
  maxFramesPerSecond: 60,

  //=== MAPA

  // Quantos pixels tem um quilometro no mapa
  pixelsPerKilometer: 100,

  // Em qual ordem cada classe sera desenhada. As primeiras ficam embaixo
  drawOrder: [
    'Vertex',
    'Edge',
    'ArrowIndicators',
    'Client',
    'Car',
    'ClientCreator',
    'StreetCreator',
    'CarCreator',
    'Debug',
  ],

  //=== PAREAMENTO CARRO & CLIENTE

  // Quantos km/h um cliente anda
  clientWalkSpeed: 4.7,

  // Quantas iteracoes, no minimo, realizar a expansao do A* de cada carro analizado
  pathExpansionIterations: 20,

  // Quantas iteracoes somar ao numero de iteracoes sempre que um carro descobrir um novo melhor caminho
  newBestPathReward: 4,

  // Quantos dos melhores nos considerar quando for calcular o tempo de entrega no-destino de cada carro
  countOfNodesToConsider: 5,

  //=== CRIACAO

  // Alcance em que ocorre o snap para vertices ja existentes, quando criando novas ruas
  newStreetVertexSnapRange: 20,

  // Distancia maxima permitida entre o mouse e uma aresta em que vai ser colocado um novo carro
  maxCarSnapDistance: 100,

  //=== CAMERA

  // Velocidade do movimento automatico da camera, em pixel/s
  cameraPanSpeed: 100,
}
