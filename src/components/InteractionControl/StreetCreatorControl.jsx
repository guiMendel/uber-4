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

  // Gerar velocidades aleatorias ou nao
  const [isRandom, setIsRandom] = useState(true)

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

  function randomizeSpeed() {
    const toggleElement = document.getElementById('toggle-speed-random')

    if (!toggleElement.classList.contains('off')) {
      const newSpeed = randomSpeed()
      setSpeed(newSpeed)
      applySpeed(newSpeed)
    }
  }

  useEffect(() => {
    // Ja inicializa com a velocidade inicial
    applySpeed()

    // Quando criar uma nova rua, se estiver em modo aleatorio, muda a velocidade
    StreetCreator.addEventListener('createstreet', randomizeSpeed)

    // Quando o componente for desmontar, tira o listener
    return () => {
      StreetCreator.removeEventListener('createstreet', randomizeSpeed)
    }
  }, [])

  return (
    <div className="interaction-control">
      {/* Titulo */}
      <p>Velocidade</p>

      {/* Area de controle */}
      <div className="speed-input-container">
        {/* Ativa / Desliga modo aleatorio */}
        <span
          id="toggle-speed-random"
          className={`toggle-random ${!isRandom && 'off'}`}
          onClick={() => setIsRandom(!isRandom)}
        >
          <label>Aleatoria</label>
          <div className="toggler"></div>
        </span>

        {/* Entrada */}
        <input
          type="number"
          className="speed-input"
          autoFocus
          value={speed}
          onChange={setSpeedFromEvent}
          disabled={isRandom}
        />

        {/* Indicacao de velocidade */}
        <span>km/h</span>
      </div>
    </div>
  )
}
