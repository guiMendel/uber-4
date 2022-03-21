import './styles/App.css'
import Canvas from './components/Canvas/Canvas.jsx'
import { useEffect } from 'react'
import seedGraph from './helpers/seedGraph'
import ArrowIndicators from './classes/ArrowIndicators'

function App() {
  useEffect(() => {
    // Gera um grafo de teste
    seedGraph()

    // Cria o singleton ArrowIndicators
    new ArrowIndicators()
  }, [])

  return (
    <div className="App">
      <Canvas />
    </div>
  )
}

export default App
