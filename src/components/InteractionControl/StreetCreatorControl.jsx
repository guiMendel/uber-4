import { useEffect, useState } from 'react'
import StreetCreator from '../../classes/Drawables/Creators/StreetCreator'
import appConfig from '../../configuration/appConfig'

const { pixelsPerKilometer } = appConfig

// Gera uma velocidade aleatoria
const randomSpeed = () => Math.round(Math.random() * (100 - 30) + 30)

// Um componente com a interface para configurar a criacao de nvoas ruas
export default function StreetCreatorControl() {
  // Valor inserido
  const [speed, setSpeed] = useState(randomSpeed())

  // Funcao que atualiza o valor da velocidade e avisa a classe de criar ruas
  function setSpeedFromEvent({ target }) {
    // Ignora se o tamanho for maior q 3
    if (target.value.toString().length > 3) return

    setSpeed(target.value)
    applySpeed(target.value)
  }

  // Avisa a classe de criar ruas da velocidade
  function applySpeed(overrideSpeed) {
    StreetCreator.setStreetSpeed((overrideSpeed ?? speed) * pixelsPerKilometer)
  }

  // Ja inicializa com a velocidade inicial
  useEffect(applySpeed, [])

  return (
    <div className="street-interaction-control">
      <p>Velocidade</p>
      <div className="speed-input">
        <input
          type="number"
          autoFocus
          value={speed}
          onChange={setSpeedFromEvent}
        />
        <span>km/h</span>
      </div>
    </div>
  )
}
