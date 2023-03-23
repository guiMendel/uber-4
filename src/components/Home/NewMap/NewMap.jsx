import MenuSFX from '../../../classes/MenuSFX'

export default function NewMap({ setNextMenu, menuOptionClass }) {
  const hoverSFX = () => MenuSFX.playHover()

  const bindClick = (menu) => () => {
    setNextMenu(menu)
    MenuSFX.playClick()
  }

  return (
    <>
      <button
        onMouseEnter={hoverSFX}
        className={menuOptionClass('city-blocks')}
        onClick={bindClick('city-blocks')}
      >
        City Blocks
      </button>
      <button
        onMouseEnter={hoverSFX}
        className={menuOptionClass('random')}
        onClick={bindClick('random')}
      >
        Random
      </button>
      <button
        onMouseEnter={hoverSFX}
        className={menuOptionClass('blank')}
        onClick={bindClick('blank')}
      >
        Blank
      </button>
    </>
  )
}
