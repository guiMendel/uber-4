export default function NewMap({ setNextMenu, menuOptionClass }) {
  return (
    <>
      <button className={menuOptionClass('city-blocks')}>City Blocks</button>
      <button className={menuOptionClass('random')}>Random</button>
      <button className={menuOptionClass('start')} onClick={() => setNextMenu('start')}>Blank</button>
    </>
  )
}
