import { useEffect, useState } from 'react'
import ButtonReference from '../../classes/ButtonReference'
import IO from '../../classes/IO'
import './Button.css'

// Componente de botao que automaticamente se inscreve em buttons de IO
export default function Button({ children, name, help, rigthTooltip }) {
  // Cria uma referencia para este botao
  const [buttonReference, setButtonReference] = useState(new ButtonReference())

  useEffect(() => {
    // Declara sua existencia
    if (name == undefined)
      throw new Error('Faltou passar o nome para um dos botoes')

    if (IO.buttons[name])
      throw new Error(
        `Existem dois botoes com o mesmo nome declarado "${name}"`
      )

    IO.buttons[name] = buttonReference
  }, [])

  return (
    <button onClick={() => buttonReference.trigger()} className="custom-button">
      {children}

      <p className={'tooltip' + (rigthTooltip ? ' right' : '')}>{help}</p>
    </button>
  )
}
