import './styles/App.css'
import Canvas from './components/Canvas/Canvas.jsx'
import Button from './components/Button/Button.jsx'
import InteractionControl from './components/InteractionControl/InteractionControl'
import Coordinates from './components/Coordinates/Coordinates'
import ErrorDisplay from './components/ErrorDisplay/ErrorDisplay'
import SimulationControl from './components/SimulationControl/SimulationControl'
import SideMenu from './components/SideMenu/SideMenu'

// Icones
import { FaUserPlus, FaPencilAlt, FaCarSide, FaPlus } from 'react-icons/fa'

export default function App() {
  return (
    <div className="App">
      <SideMenu/>

      <Canvas />

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
