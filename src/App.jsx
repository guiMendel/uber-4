import './styles/App.css'
import Canvas from './components/Canvas/Canvas.jsx'
import { useEffect } from 'react'
import seedGraph from './helpers/seedGraph'

function App() {
  useEffect(() => {
    // Gera um grafo de teste
    seedGraph()
  }, [])

  return (
    <div className="App">
      <Canvas />
    </div>
  )
}

export default App
