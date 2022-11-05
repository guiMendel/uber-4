import './home.css'

export default function Home() {
  return (
    <div className="home-container">
      {/* Main Title */}
      <h1>Cabber</h1>

      {/* Subtitle */}
      <h2>A taxi app simulation</h2>

      <div className="menus">
        {/* Main Menu */}
        <div className="main-menu">
          {/* Create new map */}
          <button className="new-map">New Map</button>

          {/* Access simulation options */}
          <button className="configuration">Configuration</button>

          {/* See credits */}
          <button className="credits">Credits</button>
        </div>

        {/* Second screen */}
        <div className="second-screen"></div>

        {/* Third screen */}
        <div className="third-screen"></div>
      </div>
    </div>
  )
}
