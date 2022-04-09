import { useEffect, useState } from 'react'
import IO from '../../classes/IO'
import appConfig from '../../configuration/appConfig'
import './Coordinates.css'

const { pixelsPerKilometer } = appConfig

export default function Coordinates() {
  // Guarda as coordenadas
  const [coords, setCoords] = useState(null)

  // Se inscreve para o movimento do mouse
  useEffect(
    () =>
      IO.addEventListener('mousemove', ({ mapPosition }) => {
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
          <span>MAPA</span>
          <span> {coords.map.x} </span> <span> {coords.map.y} </span>
        </section>
        <section>
          {' '}
          <span>REAL</span>
          <span> {coords.real.x} </span> <span> {coords.real.y} </span>
        </section>
      </div>
    )
  else return null
}
