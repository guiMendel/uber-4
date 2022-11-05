import './simulation.css'

import Canvas from '../Canvas/Canvas.jsx'
import Button from '../Button/Button.jsx'
import InteractionControl from '../InteractionControl/InteractionControl'
import Coordinates from '../Coordinates/Coordinates'
import ErrorDisplay from '../ErrorDisplay/ErrorDisplay'
import SimulationControl from '../SimulationControl/SimulationControl'


// Icones
import { FaUserPlus, FaPencilAlt, FaCarSide, FaPlus } from 'react-icons/fa'

export default function Simulation({mapParams}) {
  return (
    <div className="simulation-view">
      {/* Curtain that reveals the simulation */}
      <div className="curtain"></div>
      
      <Canvas mapParams={mapParams} />

      {/* Mostra erros conforme eles aparecem */}
      <ErrorDisplay />

      {/* Espaco em que aparecem os controles da interacao atual com o mapa */}
      <InteractionControl />

      {/* Mostra as coordenadas do cursor */}
      <Coordinates />

      {/* Botao de pausar e retomar simulacao */}
      <SimulationControl />

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
