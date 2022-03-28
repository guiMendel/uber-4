import './styles/App.css'
import Canvas from './components/Canvas/Canvas.jsx'
import Button from './components/Button/Button.jsx'
import Client from './classes/Drawables/Client'

// Icones
import { FaCar, FaUserPlus, FaPencilAlt } from 'react-icons/fa'
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
        <Button
          name={'select-route'}
          help={'Encontrar uma rota'}
          rigthTooltip
        >
          <FaCar />
        </Button>
      </div>

      {/* Contem os butoes de acoes do mapa */}
      <div className="map actions">
        {/* Adiciona um novo vertice */}
        <Button name={'new-client'} help={'Adicionar um novo cliente'}>
          <FaUserPlus />
        </Button>

        {/* Adiciona uma nova aresta */}
        <Button name={'draw'} help={'Adicionar novas ruas'}>
          <FaPencilAlt />
        </Button>
      </div>
    </div>
  )
}

export default App
