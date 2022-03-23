import './styles/App.css'
import Canvas from './components/Canvas/Canvas.jsx'
import Button from './components/Button/Button.jsx'

// Icones
import { FaCar } from 'react-icons/fa'

function App() {
  return (
    <div className="App">
      <Canvas />

      {/* Contem os butoes de acoes do cliente */}
      <div className="client actions">
        <Button>
          <FaCar />
        </Button> 
      </div>
    </div>
  )
}

export default App
