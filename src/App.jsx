import { createContext } from 'react'
import { useState } from 'react'
import Home from './components/Home/Home'
import Simulation from './components/Simulation/Simulation'
import './styles/App.css'

export default function App() {
  // Whether to show map or title screen
  const [showTitleScreen, setShowTitleScreen] = useState(true)

  const [mapParams, setMapParams] = useState({ method: null })

  return showTitleScreen ? (
    <Home
      startSimulation={() => setShowTitleScreen(false)}
      setMapParams={setMapParams}
    />
  ) : (
    <Simulation mapParams={mapParams} />
  )
}
