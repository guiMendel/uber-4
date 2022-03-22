// Configuracoes gerais do aplicativo
export default {
  //=== GERAL

  // Numero maximo de frames por segundo
  maxFramesPerSecond: 60,

  //=== MAPA

  // Quantos pixels tem um quilometro no mapa
  pixelsPerKilometer: 100,

  // Em qual ordem cada classe sera desenhada. As primeiras ficam embaixo
  drawOrder: ['Vertex', 'Edge', 'ArrowIndicators', 'Client', 'Car'],

  //=== PAREAMENTO CARRO & CLIENTE

  // Quantas iteracoes, no minimo, realizar a expansao do A* de cada carro analizado
  pathExpansionIterations: 10,

  // Quantas iteracoes somar ao numero de iteracoes sempre que um carro descobrir um novo melhor caminho
  newBestPathReward: 2,
}
