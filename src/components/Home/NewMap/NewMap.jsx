export default function NewMap({ setNextMenu, menuOptionClass }) {
  return (
    <>
      <button
        className={menuOptionClass('city-blocks')}
        onClick={() => setNextMenu('city-blocks')}
      >
        City Blocks
      </button>
      <button
        className={menuOptionClass('random')}
        onClick={() => setNextMenu('random')}
      >
        Random
      </button>
      <button
        className={menuOptionClass('blank')}
        onClick={() => setNextMenu('blank')}
      >
        Blank
      </button>
    </>
  )
}
