import './styles/App.css'
import Canvas from './components/Canvas/Canvas.jsx'
import Button from './components/Button/Button.jsx'
import Client from './classes/Drawables/Client'

// Icones
import { FaCar } from 'react-icons/fa'
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
        <Button name={'select-route'}>
          <FaCar />
        </Button>
      </div>
    </div>
  )
}

export default App
