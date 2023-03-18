import './SimulationControl.css'
import { FaPause, FaPlay, FaSync, FaUserClock } from 'react-icons/fa'
import Button from '../Button/Button'
import { useEffect, useState } from 'react'
import Simulation from '../../classes/Simulation'

export default function SimulationControl() {
  // Mantem registro do tempo atual da simulacao
  const [time, setTime] = useState(0)

  // Se inscreve para manter o tempo atualizado
  useEffect(
    () =>
      Simulation.addEventListener('timepass', (newTime) => {
        const roundedTime = Math.floor(newTime)

        setTime(
          roundedTime +
            'h' +
            Math.round((newTime - roundedTime) * 60).toLocaleString('pt-BR', {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })
        )
      }),
    []
  )

  return (
    <div className="simulation-toggle-container">
      <Button name="auto-assign" help="Auto-assign cars" isSwitch startOn>
        <FaSync />
      </Button>

      <Button name="auto-generate-clients" help="Auto-generate clients" isSwitch startOn>
        <FaUserClock />
      </Button>

      <div className="toggle-container">
        <Button
          className={'toggle-simulation custom-button'}
          name={'toggle-simulation'}
          isSwitch
          switchOnChildren={<FaPause />}
        >
          <FaPlay style={{ marginLeft: '0.4rem' }} />
        </Button>

        <span style={{ visibility: time == 0 ? 'hidden' : 'unset' }}>
          {time}
        </span>
      </div>
    </div>
  )
}
