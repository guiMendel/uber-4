import { useEffect, useState } from 'react'
import IO from '../../classes/IO'
import Configuration from '../../configuration/Configuration'
import './Coordinates.css'

export default function Coordinates() {
  // Guarda as coordenadas
  const [coords, setCoords] = useState(null)

  // Se inscreve para o movimento do mouse
  useEffect(
    () =>
      IO.addEventListener('mousemove', ({ mapPosition }) => {
        const { pixelsPerKilometer } = Configuration.getInstance().general

        setCoords({
          map: {
            x: Math.round(mapPosition.x * 100) / 100,
            y: Math.round(mapPosition.y * 100) / 100,
          },
          real: {
            x: Math.round((mapPosition.x / pixelsPerKilometer) * 100) / 100,
            y: Math.round((mapPosition.y / pixelsPerKilometer) * 100) / 100,
          },
        })
      }),
    []
  )

  if (coords)
    return (
      <div className="coordinates">
        <section>
          {' '}
          <span>PIXELS</span>
          <span> {coords.map.x} </span> <span> {coords.map.y} </span>
        </section>
        <section>
          {' '}
          <span>KMS</span>
          <span> {coords.real.x} </span> <span> {coords.real.y} </span>
        </section>
      </div>
    )
  else return null
}
