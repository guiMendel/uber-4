import Drawable from './Drawables/Drawable'

// Este modulo fornece facilidade para realizar IO com o mapa
export default class IO extends Drawable {
  // Conhece a atual posicao do cursor em tela
  static mouse = { screenX: null, screenY: null }

  constructor() {
    // Chama super
    super(1, {})

    // Mantem a posicao do cursor atualizada
    window.addEventListener('mousemove', ({ clientX, clientY }) => {
      IO.mouse.screenX = clientX
      IO.mouse.screenY = clientY
    })
  }

  draw(context) {
    // Desenha um arco na posicao do mouse
    context.fillStyle = 'blue'

    context.beginPath()

    context.arc(IO.mouse.screenX, IO.mouse.screenY, 10, 0, Math.PI * 2)

    context.fill()
  }
}
