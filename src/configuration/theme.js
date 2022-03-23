const streetWidth = 25

// Define as cores do aplicativo
export default {
  // A cor do plano de fundo do mapa
  mapBackground: '#cccccc',

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

  // A largura dos carros
  carWidth: streetWidth * 1.1,

  // A largura dos clientes
  clientWidth: streetWidth,
}
