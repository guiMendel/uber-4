import MenuSFX from '../../../classes/MenuSFX'
import ConfigurationClass from '../../../configuration/Configuration'
import convertCase from '../../../helpers/convertCase'

export default function Configuration({ setNextMenu, menuOptionClass }) {
  const hoverSFX = () => MenuSFX.playHover()

  const bindClick = (menu) => () => {
    setNextMenu(menu)
    MenuSFX.playClick()
  }

  return (
    <>
      {Object.keys(ConfigurationClass.getInstance()).map((configName) => (
        <button
          onMouseEnter={hoverSFX}
          className={'configuration-tab ' + menuOptionClass(configName)}
          key={configName}
          onClick={bindClick(configName)}
        >
          {convertCase(configName)}
        </button>
      ))}
    </>
  )
}
