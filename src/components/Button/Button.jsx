import { useEffect, useState } from 'react'
import IO from '../../classes/IO'
import './Button.css'

// Componente de botao que automaticamente se inscreve em buttons de IO
export default function Button({
  children,
  name,
  help,
  rigthTooltip,
  isSwitch,
}) {
  // Caso seja interruptor, guarda o estado
  const [value, setValue] = useState(false)

  useEffect(() => {
    // Garante ter um nome
    if (name == undefined)
      throw new Error('Faltou passar o nome para um dos botoes')
  }, [])

  const activate = () => {
    if (isSwitch) setValue(!value)
    IO.triggerButton(name, { value: !value, setValue })
  }

  return (
    <button
      onClick={activate}
      className={`custom-button ${isSwitch && value ? 'active' : ''}`}
    >
      {children}

      <p className={'tooltip' + (rigthTooltip ? ' right' : '')}>{help}</p>
    </button>
  )
}
