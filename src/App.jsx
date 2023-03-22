import { createContext } from 'react'
import { useState } from 'react'
import Random from './classes/Random'
import Home from './components/Home/Home'
import Simulation from './components/Simulation/Simulation'
import './styles/App.css'

// Initial parameters for map preview
const initialParameters = {
  method: 'city-blocks',
  parameters: {
    numberOfBlocks: Random.rangeInt(80, 100),
    blockSize: Random.rangeInt(150, 170),
    numberOfCars: Random.rangeInt(5, 11),
    numberOfClients: Random.rangeInt(2, 5),
    blocksAngle: Random.rangeFloat(0, 90),
    vertexOmitChance: 7,
    edgeOmitChance: 30,
    lowSpeedLaneProportion: 10,
    highSpeedLaneProportion: 15,
  },
}

export default function App() {
  // Whether to show map or title screen
  const [showTitleScreen, setShowTitleScreen] = useState(false)

  return (
    <>
      <Simulation mapParams={initialParameters} />

      {showTitleScreen && (
        <Home startSimulation={() => setShowTitleScreen(false)} />
      )}
    </>
  )
}
