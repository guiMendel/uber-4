import './styles/App.css'
import Canvas from './components/Canvas/Canvas.jsx'
import Button from './components/Button/Button.jsx'
import InteractionControl from './components/InteractionControl/InteractionControl'
import Coordinates from './components/Coordinates/Coordinates'

// Icones
import {
  FaUserPlus,
  FaPencilAlt,
  FaCarSide,
  FaPlus,
  FaPlay,
  FaPause,
} from 'react-icons/fa'
import ErrorDisplay from './components/ErrorDisplay/ErrorDisplay'
import { useEffect, useState } from 'react'
import Simulation from './classes/Simulation'

export default function App() {
  // Mantem registro do tempo atual da simulacao
  const [time, setTime] = useState(0)

  // Se inscreve para manter o tempo atualizado
  useEffect(
    () =>
      Simulation.addEventListener('timepass', (newTime) =>
        setTime(newTime.toFixed(2))
      ),
    []
  )

  return (
    <div className="App">
      <Canvas />

      {/* Mostra erros conforme eles aparecem */}
      <ErrorDisplay />

      {/* Espaco em que aparecem os controles da interacao atual com o mapa */}
      <InteractionControl />

      {/* Mostra as coordenadas do cursor */}
      <Coordinates />

      {/* Botao de pausar e retomar simulacao */}
      <div className="simulation-toggle-container">
        <Button
          className={'toggle-simulation custom-button'}
          name={'toggle-simulation'}
          isSwitch
          switchOnChildren={<FaPause />}
        >
          <FaPlay style={{ marginLeft: '0.4rem' }} />
        </Button>

        {time != 0 && <span>{time}</span>}
      </div>

      {/* Contem os botoes de acoes do mapa */}
      <div className="map actions">
        <Button name={'new-street'} help={'Alterar ruas'}>
          <FaPencilAlt />
        </Button>

        <Button name={'new-client'} help={'Adicionar novos clientes'}>
          <FaUserPlus />
        </Button>

        <Button name={'new-car'} help={'Adicionar novos carros'}>
          <div className="new-car-icons">
            <FaCarSide className="car-icon" />
            <FaPlus className="plus-icon" />
          </div>
        </Button>
      </div>
    </div>
  )
}
