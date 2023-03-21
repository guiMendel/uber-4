import ConfigurationClass from '../../../configuration/Configuration'
import convertCase from '../../../helpers/convertCase'

export default function Configuration({ setNextMenu, menuOptionClass }) {
  return (
    <>
      {Object.keys(ConfigurationClass.getInstance()).map((configName) => (
        <button
          className={'configuration-tab ' + menuOptionClass(configName)}
          key={configName}
          onClick={() => setNextMenu(configName)}
        >
          {convertCase(configName)}
        </button>
      ))}
    </>
  )
}
