import Camera from './Camera'
import Drawable from './Drawables/Drawable'

// Este modulo fornece facilidade para realizar IO com o mapa
export default class IO extends Drawable {
  // Conhece a atual posicao do cursor em tela
  static mouse = {
    screenCoords: { x: null, y: null },
    get mapCoords() {
      return Camera.ScreenToMap(this.screenCoords.x, this.screenCoords.y)
    },
  }

  // Inicia as funcoes do IO
  static setup() {
    // Mantem a posicao do cursor atualizada
    window.addEventListener('mousemove', ({ clientX, clientY }) => {
      IO.mouse.screenCoords.x = clientX
      IO.mouse.screenCoords.y = clientY
    })
  }

  constructor() {
    // Chama super
    super(1, {})
  }

  draw(drawer) {
    // Desenha um arco em sua posicao
    const { fillArc } = drawer.drawWith({ style: 'blue' })

    fillArc(IO.mouse.mapCoords, 10)
  }
}
