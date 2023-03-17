import { useEffect, useState } from 'react'
import StreetCreator from '../../classes/Drawables/Creators/StreetCreator'
import Edge from '../../classes/Drawables/Edge'
import Random from '../../classes/Random'
import appConfig from '../../configuration/appConfig'

const { pixelsPerKilometer } = appConfig

// Gera uma velocidade aleatoria
const randomSpeed = () => Random.rangeInt(30, 100)

// Um componente com a interface para configurar a criacao de nvoas ruas
export default function StreetCreatorControl() {
  // Valor inserido
  const [speed, setSpeed] = useState(randomSpeed())

  // Gerar velocidades aleatorias ou nao
  const [isRandom, setIsRandom] = useState(true)

  // Caso a velocidade na interface se refere a proxima rua a ser criada, ou a rua selecionada
  const [isStreetSelected, setIsStreetSelected] = useState(false)

  // Funcao que atualiza o valor da velocidade e avisa a classe de criar ruas
  function setSpeedFromEvent({ target }) {
    // Ignora se o tamanho for maior q 3
    if (target.value.toString().length > 3) return

    setSpeed(target.value)

    // Se tiver uma rua selecionada, altera a velocidade da rua
    if (isStreetSelected) {
      StreetCreator.getInstance().selectedEdge.mapSpeed =
        target.value * pixelsPerKilometer

      // Atualiza os valores recorde
      Edge.updateRecordEdges()
    } else applySpeed(target.value)
  }

  // Avisa a classe de criar ruas da velocidade
  function applySpeed(overrideSpeed) {
    StreetCreator.setStreetSpeed((overrideSpeed ?? speed) * pixelsPerKilometer)
  }

  function randomizeSpeed(forceRandomize) {
    const toggleElement = document.getElementById('toggle-speed-random')

    if (forceRandomize || !toggleElement.classList.contains('off')) {
      const newSpeed = randomSpeed()
      setSpeed(newSpeed)
      applySpeed(newSpeed)
    }
  }

  function handleStreetSelect(selectedEdge) {
    setIsStreetSelected(selectedEdge != null)

    // Atualiza o indicador de velocidade
    if (selectedEdge != null) {
      setSpeed(Math.round(selectedEdge.mapSpeed / pixelsPerKilometer))
    } else {
      randomizeSpeed(true)
    }
  }

  useEffect(() => {
    // Ja inicializa com a velocidade inicial
    applySpeed()

    // Quando criar uma nova rua, se estiver em modo aleatorio, muda a velocidade
    StreetCreator.addEventListener('createstreet', randomizeSpeed)

    // Fica de olho em selecao de rua
    StreetCreator.addEventListener('selectstreet', handleStreetSelect)

    // Quando o componente for desmontar, tira o listener
    return () => {
      StreetCreator.removeEventListener('createstreet', randomizeSpeed)
      StreetCreator.removeEventListener('selectstreet', handleStreetSelect)
    }
  }, [])

  return (
    <div className="interaction-control">
      {/* Titulo */}
      <h1>Speed</h1>

      {/* Area de controle */}
      <div className="speed-input-container">
        {/* Ativa / Desliga modo aleatorio */}
        {!isStreetSelected && (
          <span
            id="toggle-speed-random"
            className={`toggle-random ${!isRandom && 'off'}`}
            onClick={() => setIsRandom(!isRandom)}
          >
            <label>Random</label>
            <div className="toggler"></div>
          </span>
        )}

        {/* Entrada */}
        <input
          type="number"
          className="speed-input"
          autoFocus
          value={speed}
          onChange={setSpeedFromEvent}
          disabled={isRandom && !isStreetSelected}
        />

        {/* Indicacao de velocidade */}
        <span>km/h</span>
      </div>
    </div>
  )
}
