import Configuration from '../configuration/Configuration'
import {
  angleBetween,
  displacePoint,
  getDistance,
} from '../helpers/vectorDistance'
import Camera from './Camera'
import Drawable from './Drawables/Drawable'

// Um wrapper de context que fornece metodos mais simples de utilziar e automatiza alguns processos
export default class Drawer {
  constructor(context) {
    // Armazena o context
    this.context = context

    const drawableSubclasses = Object.keys(Drawable.drawableInstances)

    // Garante que todas as subclasses de Drawable estejam definidos em drawOrder
    const missingClass = drawableSubclasses.find(
      (element) =>
        !Configuration.getInstance().general.drawOrder.includes(element)
    )

    if (missingClass != undefined)
      throw new Error(
        `You forgot to define the drawOrder for the Drawable class: ${missingClass}`
      )
  }

  // Desenha o frame atual da tela
  drawFrame() {
    const { fillRect } = this.drawWith({
      style: Configuration.getInstance().theme.mapBackground,
    })

    // Limpa a tela desenhando background em tudo que eh visivel
    fillRect(Camera.ScreenToMap(0, 0), {
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Renderiza as instancias em ordem
    for (const drawableClassName of Configuration.getInstance().general
      .drawOrder) {
      if (Drawable.drawableInstances[drawableClassName] == undefined) continue

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
  drawWith({
    style = 'black',
    fillStyle,
    strokeStyle,
    lineWidth = 2,
    opacity = 1,
  }) {
    // Facilitar acesso
    const { context } = this

    // Define o estilo
    const configDrawer = () => {
      context.strokeStyle = strokeStyle ?? style
      context.fillStyle = fillStyle ?? style
      context.lineWidth = lineWidth
      context.globalAlpha = opacity
    }

    // Aux de arco
    function arc({ x, y }, radius, angles = { startAngle: 0, endAngle: 360 }) {
      configDrawer()

      context.beginPath()

      context.arc(
        x,
        y,
        radius,
        (angles.startAngle * Math.PI) / 180,
        (angles.endAngle * Math.PI) / 180
      )
    }

    function strokePath(...coords) {
      if (coords.length < 2)
        throw new Error("Drawer's strokePath needs at least 2 coordinates")

      configDrawer()

      context.beginPath()

      context.moveTo(coords[0].x, coords[0].y)

      for (const { x, y } of coords.slice(1)) context.lineTo(x, y)

      context.stroke()
    }

    return {
      setStyle(newStyle) {
        if (newStyle.style) style = newStyle.style
        if (newStyle.fillStyle) fillStyle = newStyle.fillStyle
        if (newStyle.strokeStyle) strokeStyle = newStyle.strokeStyle
        if (newStyle.lineWidth) lineWidth = newStyle.lineWidth
      },

      fillRect({ x, y }, { width, height }) {
        configDrawer()

        context.fillRect(x, y, width, height)
      },

      fillArc(...args) {
        arc(...args)

        context.fill()
      },

      fillStrokeArc(...args) {
        arc(...args)

        context.fill()
        context.stroke()
      },

      strokeArc(...args) {
        arc(...args)

        context.stroke()
      },

      strokePath,

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

      frettedPath({ gap = 10, length = 10 }, ...coords) {
        if (coords.length < 2)
          throw new Error("Drawer's strokePath needs at least 2 coordinates")

        for (let i = 1; i < coords.length; i++) {
          const source = coords[i - 1]
          const destination = coords[i]
          const distance = getDistance(source, destination)
          const angle = angleBetween(source, destination)

          // A comecar da origem, desenhar linhas ao longo dela, e ir deslocando o ponto de desenho
          let displacement = 0

          // Enquanto ainda couberem linhas
          while (displacement + gap + length <= distance) {
            strokePath(
              displacePoint(source, displacement, angle),
              displacePoint(source, displacement + length, angle)
            )

            // Aumenta o deslocamento
            displacement += gap + length
          }
        }
      },
    }
  }
}
