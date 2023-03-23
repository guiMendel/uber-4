import './SimulationControl.css'
import { FaPause, FaPlay, FaSync, FaUserClock, FaClock } from 'react-icons/fa'
import Button from '../Button/Button'
import { useEffect, useState } from 'react'
import Simulation from '../../classes/Simulation'
import Slider from '../Slider/Slider'
import Configuration from '../../configuration/Configuration'

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
  const [timescaleView, setTimescaleView] = useState(
    Configuration.getInstance().general.timescale
  )

  const setTimescale = (value) => {
    setTimescaleView(value)
    Configuration.getInstance().general.timescale = value
  }

  return (
    <div className="simulation-main-control">
      <div className="simulation-control-section">
        <Button name="auto-assign" help="Auto-assign cars" isSwitch startOn>
          <FaSync />
        </Button>

        <Button
          name="auto-generate-clients"
          help="Auto-generate clients"
          isSwitch
          startOn
        >
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

      <div className="simulation-control-section timescale">
        <FaClock className="clock-icon" />

        <Slider
          value={timescaleView}
          setValue={setTimescale}
          min={Configuration.configurationParams.general.timescale.min}
          max={Configuration.configurationParams.general.timescale.max}
          noNumber
          floatingPoint
        ></Slider>
      </div>
    </div>
  )
}
