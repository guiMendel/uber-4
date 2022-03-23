import appConfig from '../configuration/appConfig'
import theme from '../configuration/theme'
import Camera from './Camera'
import Drawable from './Drawables/Drawable'

const { drawOrder } = appConfig
const { mapBackground } = theme

// Um wrapper de context que fornece metodos mais simples de utilziar e automatiza alguns processos
export default class Drawer {
  constructor(context) {
    // Armazena o context
    this.context = context

    const drawableSubclasses = Object.keys(Drawable.drawableInstances)

    // Garante que todas as subclasses de Drawable estejam definidos em drawOrder
    const missingClass = drawableSubclasses.find(
      (element) => !drawOrder.includes(element)
    )

    if (missingClass != undefined)
      throw new Error(
        `Voce esqueceu de definir o drawOrder para a seguinte classe Drawable: ${missingClass}`
      )

    // Garante que todas definicoes em drawOrder sejam subclasses de Drawable
    const extraClass = drawOrder.find(
      (element) => !drawableSubclasses.includes(element)
    )

    if (extraClass != undefined)
      throw new Error(
        `Voce forneceu em drawOrder uma classe nao definida como subclasse de Drawable: ${extraClass}`
      )
  }

  // Desenha o frame atual da tela
  drawFrame() {
    const { fillRect } = this.drawWith({ style: mapBackground })

    // Limpa a tela desenhando background em tudo que eh visivel
    fillRect(Camera.ScreenToMap(0, 0), {
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Renderiza as instancias em ordem
    for (const drawableClassName of drawOrder) {
      // Desenha cada instancia desta classe
      for (const instance of Object.values(
        Drawable.drawableInstances[drawableClassName]
      )) {
        // Trigger the drawable animations
        for (const animation of instance.animations) animation()

        // Draw it
        instance.draw(this)
      }
    }
  }

  // Permite iniciar o desenho na tela em um estilo
  // Retorna um objecto que fornece diversos metodos de desenho
  drawWith(
    style = { style: 'black', fillStyle: 'black', strokeStyle: 'black' },
    width = { lineWidth: 2 }
  ) {
    // Facilitar acesso
    const { context } = this

    // Define o estilo
    const configDrawer = () => {
      context.strokeStyle = style.strokeStyle ?? style.style
      context.fillStyle = style.fillStyle ?? style.style
      context.lineWidth = width.lineWidth
    }

    return {
      fillRect({ x, y }, { width, height }) {
        configDrawer()

        context.fillRect(x, y, width, height)
      },

      fillArc({ x, y }, radius, angles = { startAngle: 0, endAngle: 360 }) {
        configDrawer()

        context.beginPath()

        context.arc(
          x,
          y,
          radius,
          (angles.startAngle * Math.PI) / 180,
          (angles.endAngle * Math.PI) / 180
        )

        context.fill()
      },

      strokePath(...coords) {
        if (context.length < 2)
          throw new Error("Drawer's strokePath needs at least 2 coordinates")

        configDrawer()

        context.beginPath()

        context.moveTo(coords[0].x, coords[0].y)

        for (const { x, y } of coords.slice(1)) context.lineTo(x, y)

        context.stroke()
      },

      drawImage(image, { x, y }, rotation, scale = 1) {
        configDrawer()

        // Pega as coordenadas centralizadas na imagem e translacionadas para a camera
        const translatedCoords = Camera.MapToScreen(x, y)

        // Salva o estado do contexto
        context.save()

        // Desloca o contexto para a imagem
        context.setTransform(1, 0, 0, 1, translatedCoords.x, translatedCoords.y)

        if (rotation != 0) {
          // Rotaciona o contexto (depois vamos desfazer isso, mas a imagem continuara rotacionada)
          context.rotate((-rotation * Math.PI) / 180)
        }

        context.drawImage(
          image,
          (-image.width * scale) / 2,
          (-image.height * scale) / 2,
          image.width * scale,
          image.height * scale
        )

        context.restore()
      },
    }
  }
}
