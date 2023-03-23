import './mapThirdScreen.css'
import { useEffect, useState } from 'react'
import Slider from '../../Slider/Slider'
import Random from '../../../classes/Random'
import convertCase from '../../../helpers/convertCase'
import MenuSFX from '../../../classes/MenuSFX'

export default function ThirdScreen({ startSimulation, configuration, owner }) {
  // Initializes the parameterValues object
  const initialParameterValues = {}

  for (const [parameter, values] of Object.entries(configuration)) {
    const { min, max } = values

    initialParameterValues[parameter] = Random.rangeInt(
      values.randMin ?? min,
      values.randMax ?? max
    )
  }

  // The value assigned to each parameter
  const [parameterValues, setParameterValues] = useState(initialParameterValues)

  useEffect(() => setParameterValues(initialParameterValues), [configuration])

  const hoverSFX = () => MenuSFX.playHover()

  const bindClick = (params) => () => {
    startSimulation(params)
    MenuSFX.playProjectorButton()
  }

  return (
    <>
      <div className="parameters">
        {/* For each config entry */}
        {Object.entries(configuration).map(
          ([parameter, { type, min, max }]) => (
            <div className="map-parameter" key={parameter}>
              <p>{convertCase(parameter)}</p>
              {type == 'number' && (
                <Slider
                  className="slider"
                  value={parameterValues[parameter]}
                  setValue={(value) =>
                    setParameterValues((currentParams) => ({
                      ...currentParams,
                      [parameter]: value,
                    }))
                  }
                  min={min}
                  max={max}
                />
              )}
            </div>
          )
        )}
      </div>

      <button
        onMouseEnter={hoverSFX}
        onClick={bindClick({ method: owner, parameters: parameterValues })}
        className="start-simulation"
      >
        Start
      </button>
    </>
  )
}
