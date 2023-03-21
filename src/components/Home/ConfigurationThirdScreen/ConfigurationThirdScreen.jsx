import { FaPalette } from 'react-icons/fa'
import './configurationThirdScreen.css'
import Slider from '../../Slider/Slider'
import convertCase from '../../../helpers/convertCase'
import { useEffect, useState } from 'react'
import Configuration from '../../../configuration/Configuration'

export default function ThirdScreen({ owner }) {
  const [parameters, setParameters] = useState(
    Configuration.configurationParams[owner]
  )

  useEffect(
    () => setParameters(Configuration.configurationParams[owner]),
    [owner]
  )

  return (
    <div className="configuration-parameters-tab">
      {Object.entries(parameters)
        // Dont' show constants
        .filter(
          ([_, configurationParams]) =>
            configurationParams.constant == undefined
        )
        .map(([configurationName, configurationParams]) => {
          // Titles
          if (configurationParams.isTitle)
            return (
              <h2 key={configurationName}>{convertCase(configurationName)}</h2>
            )

          // Numbers
          if (typeof configurationParams.default == 'number')
            return (
              <div className="configuration" key={configurationName}>
                <p>{convertCase(configurationName)}</p>
                <Slider
                  className="slider"
                  value={configurationParams.default}
                  // setValue={(value) =>
                  //   setParameterValues((currentParams) => ({
                  //     ...currentParams,
                  //     [parameter]: value,
                  //   }))
                  // }
                  min={configurationParams.min}
                  max={configurationParams.max}
                />
              </div>
            )

          // Colors
          if (typeof configurationParams.default == 'string')
            return (
              <div className="configuration" key={configurationName}>
                <p>{convertCase(configurationName)}</p>
                <label
                  className="color-picker"
                  for={`color-picker-input-${configurationName}`}
                >
                  <FaPalette className="color-icon" />
                  <div
                    className="color-preview"
                    style={{ background: configurationParams.default }}
                  ></div>
                </label>
                <input
                  type="color"
                  id={`color-picker-input-${configurationName}`}
                  className="hidden-input"
                  value={configurationParams.default}
                />
              </div>
            )
        })}
    </div>
  )
}
