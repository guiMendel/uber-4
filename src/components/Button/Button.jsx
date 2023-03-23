import { useEffect, useState } from 'react'
import IO from '../../classes/IO'
import MenuSFX from '../../classes/MenuSFX'
import './Button.css'

// Componente de botao que automaticamente se inscreve em buttons de IO
export default function Button({
  children,
  name,
  help,
  rightTooltip,
  isSwitch,
  switchOnChildren,
  startOn = false,
  ...other
}) {
  switchOnChildren ??= children

  // Caso seja interruptor, guarda o estado
  const [value, setValue] = useState(false)

  useEffect(() => {
    // Garante ter um nome
    if (name == undefined) throw new Error("Some buttons don't have a name")

    if (startOn) activate()
  }, [])

  const activate = () => {
    if (isSwitch) setValue(!value)

    IO.triggerButton(name, { value: !value, setValue })
  }

  const hoverSFX = () => MenuSFX.playHover()

  const bindClick = () => () => {
    activate()
    MenuSFX.playClick()
  }

  return (
    <button
      onMouseEnter={hoverSFX}
      onClick={bindClick()}
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
        <p className={'tooltip' + (rightTooltip ? ' right' : '')}>{help}</p>
      )}
    </button>
  )
}
