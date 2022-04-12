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
  switchOnChildren,
  ...other
}) {
  switchOnChildren ??= children

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
      style={
        isSwitch && value
          ? { backgroundColor: 'rgb(58, 58, 241)', color: 'white' }
          : {}
      }
      className={`custom-button ${isSwitch && value ? 'active' : ''}`}
      {...other}
    >
      {isSwitch && value ? switchOnChildren : children}

      {help != undefined && (
        <p className={'tooltip' + (rigthTooltip ? ' right' : '')}>{help}</p>
      )}
    </button>
  )
}
