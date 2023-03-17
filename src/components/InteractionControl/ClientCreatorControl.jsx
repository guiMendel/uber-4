import { useEffect, useState } from 'react'
import ClientCreator from '../../classes/Drawables/Creators/ClientCreator'
import Random from '../../classes/Random'
import appConfig from '../../configuration/appConfig'

const { pixelsPerKilometer } = appConfig

// Um componente com a interface para configurar a criacao automatica de novos clientes
export default function ClientCreatorControl() {
  const [autoGenerate, setAutoGenerate] = useState(false)

  return (
    <div className="interaction-control">
      {/* Titulo */}
      <h1>Auto-generate Clients</h1>

      {/* Area de controle */}
      <div className="generation-params-container">
        {/* Ativa / Desliga modo aleatorio */}
        <span
          id="toggle-auto-generate"
          className={`toggle-auto-generate ${!autoGenerate && 'off'}`}
          onClick={() => setAutoGenerate(!autoGenerate)}
        >
          <label>Toggled</label>
          <div className="toggler"></div>
        </span>

        {/* Entrada */}
        <span className="generation min">
          {/* Tempo minimo */}
          <span>Min Interval</span>

          <input type="number" className="generation-param" />
        </span>

        <span className="generation max">
          {/* Tempo minimo */}
          <span>Max Interval</span>

          <input type="number" className="generation-param" />
        </span>
      </div>
    </div>
  )
}
