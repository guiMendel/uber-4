import { useEffect, useRef, useState } from 'react'
import configureCanvas from './configureCanvas'
import Map from '../../classes/Map'

export default function Canvas({mapParams}) {
  // Pega a referencia do canvas
  const canvasRef = useRef(null)

  useEffect(() => {
    // Garantir que o canvas tenha sido referenciado
    if (canvasRef == null) throw new Error('Failed to reference the canvas')

    // Configurate canvas
    // TODO: fazer redesenhar o canvas sempre que alterar as dimensoes
    configureCanvas(canvasRef.current)

    // Pegar o context
    const context = canvasRef.current.getContext('2d')

    // Garantir que o contexto foi gerado com sucesso
    if (context == null) throw new Error('Failed to obtain the canvas context')

    // Comecar a renderizar as figuras no canvas
    new Map(context, mapParams)
  }, [])

  return (
    <canvas id='canvas' ref={canvasRef}>
      Failed to load the app's content.
    </canvas>
  )
}
