import { useEffect, useState } from 'react'
import IO from '../../classes/IO'
import './Button.css'

// Componente de botao que automaticamente se inscreve em buttons de IO
export default function Button({ children, name, help, rigthTooltip }) {
  useEffect(() => {
    // Garante ter um nome
    if (name == undefined)
      throw new Error('Faltou passar o nome para um dos botoes')
  }, [])

  return (
    <button onClick={() => IO.triggerButton(name)} className="custom-button">
      {children}

      <p className={'tooltip' + (rigthTooltip ? ' right' : '')}>{help}</p>
    </button>
  )
}
