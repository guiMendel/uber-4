import { useEffect, useRef, useState } from 'react'
import configurateCanvas from './configurateCanvas'
import Map from '../../classes/Map'

import defaultCursor from '../../assets/arrow.cur'

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
    new Map(context)
  }, [])

  return (
    <canvas id='canvas' ref={canvasRef}>
      Não foi possível carregar o conteúdo do aplicativo.
    </canvas>
  )
}
