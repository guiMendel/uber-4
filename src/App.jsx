import './styles/App.css'
import Canvas from './components/Canvas/Canvas.jsx'
import Button from './components/Button/Button.jsx'
import Client from './classes/Drawables/Client'

// Icones
import {
  FaCar,
  FaUserPlus,
  FaPencilAlt,
  FaCarSide,
  FaPlus,
} from 'react-icons/fa'
import { useEffect, useState } from 'react'

function App() {
  // Se deve mostrar os botoes de cliente
  const [showClientActions, setShowClientActions] = useState(false)

  useEffect(() => {
    // Quando um cliente for selecionado, mostre os botoes
    Client.addEventListener('select', (client) =>
      setShowClientActions(client != null)
    )
  }, [])

  return (
    <div className="App">
      <Canvas />

      {/* Contem os butoes de acoes do cliente */}
      <div
        className="client actions"
        style={{ display: showClientActions ? 'flex' : 'none' }}
      >
        <Button name={'select-route'} help={'Encontrar uma rota'} rigthTooltip>
          <FaCar />
        </Button>
      </div>

      {/* Contem os butoes de acoes do mapa */}
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

        <Button name={'draw'} help={'Adicionar novas ruas'}>
          <FaPencilAlt />
        </Button>
      </div>
    </div>
  )
}

export default App
