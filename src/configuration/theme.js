const streetWidth = 25

// Define as cores do aplicativo
export default {
  //=== GERAL

  // A cor do plano de fundo do mapa
  mapBackground: '#cccccc',

  // Velocidade geral de animacoes simples, em segundos
  generalAnimationSpeed: 0.05,

  // A cor do highlight
  highlightColor: '#168ece',

  //=== SETAS DE SENTIDO DA RUA

  // A cor das setas que indica o sentido das ruas
  streetArrowColor: '#ffffff',

  // Altura das flechas que apontam a direcao da rua
  streetArrowHeight: 10,

  // Grossura das flechas
  streetArrowWidth: streetWidth / 5,

  // Intervalo em que as setas sao desenhadas
  streetArrowInterval: 60,

  //=== RUAS

  // A cor das ruas
  // Slowest sera quando a rua tiver a menor velocidade possivel
  streetColorSlowest: '#efefef',

  // Highest sera quando a rua tiver a maior velocidade possivel
  streetColorHighest: '#b3c7fc',

  // A largura das ruas, em pixels
  streetWidth,

  //=== CLIENTES E CARROS

  // O quanto a imagem do cliente cresce quando sob o cursor
  clientHoverGrow: 1.3,

  // O raio do highlight do cliente selecionado
  selectedClientRadius: streetWidth * 0.8,

  // Cor do destino do cliente
  clientDestinationColor: '#fc3628',

  // O raio do destino
  clientDestinationRadius: streetWidth * 0.5,

  // A largura dos carros
  carWidth: streetWidth * 1.1,

  // A largura dos clientes
  clientWidth: streetWidth,

  // A cor do destaque da rota selecionada
  selectedRouteHighlight: '#b4fca9',

  // A cor do destaque da rota selecionada
  selectedRouteHighlightBeforeRdv: '#f1f783',

  // A largura do trastejado da caminhada do cliente
  clientWalkPathWidth: streetWidth / 3,

  // O tamanho de cada linha do trastejado
  clientWalkPathLineSize: 15,

  // O espaco entre as linhas do trastejado
  clientWalkPathLineGap: 15,
}
