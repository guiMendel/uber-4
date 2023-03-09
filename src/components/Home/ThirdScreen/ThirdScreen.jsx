import './thirdScreen.css'
import { useEffect, useState } from 'react'
import Slider from '../../Slider/Slider'

export default function ThirdScreen({ startSimulation, configuration, owner }) {
  // Initializes the parameterValues object
  const initialParameterValues = {}

  for (const [parameter, { min, max }] of Object.entries(configuration)) {
    initialParameterValues[parameter] =
      Math.round(Math.random() * (max - min)) + min
  }

  // The value assigned to each parameter
  const [parameterValues, setParameterValues] = useState(initialParameterValues)

  // Converts camelCase to separate case
  const convertCase = (text) => {
    const splitText = text.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
    return splitText.charAt(0).toUpperCase() + splitText.slice(1)
  }

  useEffect(() => setParameterValues(initialParameterValues), [configuration])

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
        onClick={() =>
          startSimulation({ method: owner, parameters: parameterValues })
        }
        className="start-simulation"
      >
        Start
      </button>
    </>
  )
}
