import { useEffect, useState } from 'react'
import ClientCreator from '../../classes/Drawables/Creators/ClientCreator'
import IO from '../../classes/IO'

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
    let value = parseFloat(target.value)

    if (value.toString().length > 3) return

    if (!value || isNaN(value) || value < 0.5) value = 0.5

    ClientCreator.getInstance().clientAutoGenerateCooldown.min = value
    setGenMin(value)

    if (genMax < value) setMax({ target: { value } })
  }

  const setMax = ({ target }) => {
    let value = parseFloat(target.value)

    if (value.toString().length > 3) return

    if (!value || isNaN(value) || value < genMin) value = genMin

    ClientCreator.getInstance().clientAutoGenerateCooldown.max = value
    setGenMax(value)
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
