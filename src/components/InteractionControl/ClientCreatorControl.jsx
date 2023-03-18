import { useEffect, useState } from 'react'
import ClientCreator from '../../classes/Drawables/Creators/ClientCreator'
import IO from '../../classes/IO'
import Random from '../../classes/Random'
import appConfig from '../../configuration/appConfig'

const { pixelsPerKilometer } = appConfig

// Um componente com a interface para configurar a criacao automatica de novos clientes
export default function ClientCreatorControl() {
  const [autoGenerate, setAutoGenerate] = useState(
    ClientCreator.getInstance().autoGeneration
  )
  const [genMin, setGenMin] = useState(
    ClientCreator.getInstance().clientAutoGenerateCooldown.min
  )
  const [genMax, setGenMax] = useState(
    ClientCreator.getInstance().clientAutoGenerateCooldown.max
  )

  const setMin = ({ target }) => {
    if (target.value.toString().length > 3) return

    if (target.value < 0.5) target.value = 0.5

    ClientCreator.getInstance().clientAutoGenerateCooldown.min = target.value
    setGenMin(target.value)
  }

  const setMax = ({ target }) => {
    if (target.value.toString().length > 3) return

    if (target.value < genMin) target.value = genMin

    ClientCreator.getInstance().clientAutoGenerateCooldown.max = target.value
    setGenMax(target.value)
  }

  useEffect(() => {
    const callback = ({ value }) => setAutoGenerate(value)

    IO.addButtonListener('auto-generate-clients', callback)

    return () => IO.removeButtonListener('auto-generate-clients', callback)
  }, [])

  if (autoGenerate)
    return (
      <div className="interaction-control">
        {/* Titulo */}
        <h1>Auto-generate Clients</h1>

        {/* Area de controle */}
        <div className="generation-params-container">
          {/* Entrada */}
          <span className="generation min">
            {/* Tempo minimo */}
            <span>Min Interval</span>

            <input
              type="number"
              className="generation-param"
              value={genMin}
              onChange={setMin}
            />
          </span>

          <span className="generation max">
            {/* Tempo minimo */}
            <span>Max Interval</span>

            <input
              type="number"
              className="generation-param"
              value={genMax}
              onChange={setMax}
            />
          </span>
        </div>
      </div>
    )
  else return null
}
