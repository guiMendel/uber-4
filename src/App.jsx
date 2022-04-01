import './styles/App.css'
import Canvas from './components/Canvas/Canvas.jsx'
import Button from './components/Button/Button.jsx'
import InteractionControl from './components/InteractionControl/InteractionControl'

// Icones
import {
  FaCar,
  FaUserPlus,
  FaPencilAlt,
  FaCarSide,
  FaPlus,
} from 'react-icons/fa'

export default function App() {
  return (
    <div className="App">
      <Canvas />

      {/* Espaco em que aparecem os controles da interacao atual com o mapa */}
      <InteractionControl />

      {/* Contem os botoes de acoes do mapa */}
      <div className="map actions">
        <Button name={'new-car'} help={'Adicionar novos carros'}>
          <div className="new-car-icons">
            <FaCarSide className="car-icon" />
            <FaPlus className="plus-icon" />
          </div>
        </Button>

        <Button name={'new-client'} help={'Adicionar novos clientes'}>
          <FaUserPlus />
        </Button>

        <Button name={'new-street'} help={'Adicionar novas ruas'}>
          <FaPencilAlt />
        </Button>
      </div>
    </div>
  )
}
