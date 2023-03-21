import { FaInfoCircle, FaPalette } from 'react-icons/fa'
import './configurationThirdScreen.css'
import Slider from '../../Slider/Slider'
import convertCase from '../../../helpers/convertCase'
import { useEffect, useState } from 'react'
import Configuration from '../../../configuration/Configuration'

// Returns configurable parameters for a tab
function getTabParametersEntries(configurationTab) {
  return Object.entries(
    Configuration.configurationParams[configurationTab]
  ).filter(
    // Filter out any constant parameters
    ([_, params]) => params.constant == undefined
  )
}

// Returns the initial values of the configuration tab
function getInitialValues(configurationTab, getFromLocal) {
  const storedValues = localStorage.getItem(`configuration-${configurationTab}`)

  if (getFromLocal && storedValues != null && storedValues != 'undefined')
    return JSON.parse(storedValues)

  return Object.fromEntries(
    getTabParametersEntries(configurationTab)
      // Remove titles
      .filter(([_, param]) => !param.isTitle)
      // Keep only default values
      .map(([configName, { default: value }]) => [configName, value])
  )
}

export default function ThirdScreen({ owner }) {
  const [parameters, setParameters] = useState(
    Object.fromEntries(getTabParametersEntries(owner))
  )

  useEffect(() => {
    setParameters(Object.fromEntries(getTabParametersEntries(owner)))
    setValues(getInitialValues(owner, true))
  }, [owner])

  // Actual selected values
  const [values, setValuesRaw] = useState(getInitialValues(owner, true))

  // Set values in react and in Configuration instance
  const setValues = (newValues) => {
    // Set in actual config
    Object.assign(Configuration.getInstance()[owner], newValues)

    // Persist for future sessions
    localStorage.setItem(`configuration-${owner}`, JSON.stringify(newValues))

    // Set in react
    setValuesRaw(newValues)
  }

  const setValueFor = (param, value) => {
    setValues({
      ...values,
      [param]: value,
    })
  }

  return (
    <>
      <div className="configuration-parameters-tab">
        {Object.entries(parameters).map(
          ([configurationName, configurationParams]) => {
            // Titles
            if (configurationParams.isTitle)
              return (
                <h2 key={configurationName}>
                  {convertCase(configurationName)}
                </h2>
              )

            return (
              <div className="configuration" key={configurationName}>
                <span
                  className="title-description"
                  title={configurationParams.description}
                >
                  <p>{convertCase(configurationName)}</p>
                  {configurationParams.description != undefined && (
                    <FaInfoCircle className="description-icon" />
                  )}
                </span>

                {typeof configurationParams.default == 'number' ? (
                  // Numbers
                  <Slider
                    className="slider"
                    value={values[configurationName]}
                    setValue={(value) => setValueFor(configurationName, value)}
                    min={configurationParams.min}
                    max={configurationParams.max}
                  />
                ) : (
                  // Colors
                  <>
                    <label
                      className="color-picker"
                      htmlFor={`color-picker-input-${configurationName}`}
                    >
                      <FaPalette className="color-icon" />
                      <div
                        className="color-preview"
                        style={{ background: values[configurationName] }}
                      ></div>
                    </label>
                    <input
                      type="color"
                      id={`color-picker-input-${configurationName}`}
                      className="hidden-input"
                      value={values[configurationName]}
                      onChange={({ target }) =>
                        setValueFor(configurationName, target.value)
                      }
                    />
                  </>
                )}
              </div>
            )
          }
        )}
      </div>

      <button
        onClick={() => setValues(getInitialValues(owner))}
        className="reset-button"
      >
        Reset
      </button>
    </>
  )
}
