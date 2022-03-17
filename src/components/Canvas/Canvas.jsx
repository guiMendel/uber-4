import { useEffect, useRef } from 'react'
import delay from '../../helpers/delay'
import theme from '../../configuration/theme'
import appConfig from '../../configuration/appConfig'
import configurateCanvas from './configurateCanvas'

export default function Canvas() {
  // Pega a referencia do canvas
  const canvasRef = useRef(null)

  useEffect(() => {
    // Garantir que o canvas tenha sido referenciado
    if (canvasRef == null) throw new Error('Falha em referenciar o canvas')

    // Configurate canvas
    // TODO: fazer redesenhar o canvas sempre que alterar as dimensoes
    configurateCanvas(canvasRef.current)

    // Pegar o context
    const context = canvasRef.current.getContext('2d')

    // Garantir que o contexto foi gerado com sucesso
    if (context == null) throw new Error('Falha em obter o contexto')

    // Comecar a renderizar as figuras no canvas
    startRendering(context)
  }, [])

  async function startRendering(context) {
    // Loop infinito dos frames
    while (true) {
      // Limpa desenhos e carrega background
      context.fillStyle = theme.mapBackground
      context.fillRect(0, 0, window.innerWidth, window.innerHeight)

      // Espera o tempo de fps
      await delay(1 / appConfig.maxFramesPerSecond)
    }
  }

  return (
    <canvas ref={canvasRef}>
      Não foi possível carregar o conteúdo do aplicativo.
    </canvas>
  )
}
