import React, { useState } from 'react'
import './home.css'
import NewMap from './NewMap/NewMap'
import Configuration from './Configuration/Configuration'
import Credits from './Credits/Credits'
import { IoIosArrowBack } from 'react-icons/io'
import mapParamsConfiguration from './mapParamsConfiguration'
import MapThirdScreen from './MapThirdScreen/MapThirdScreen'
import ConfigurationThirdScreen from './ConfigurationThirdScreen/ConfigurationThirdScreen'

import Camera from '../../classes/Camera'
import IO from '../../classes/IO'
import Map from '../../classes/Map'
import Simulation from '../../classes/Simulation'
import MenuSFX from '../../classes/MenuSFX'

export default function Home({ hideHomeScreen }) {
  const [mapParams, setMapParams] = useState({ method: null, parameters: {} })

  // Closes the curtain
  const [closingCurtain, setClosingCurtain] = useState(false)

  // Menu to show on second screen
  // A string which identifies the second screen
  const [secondScreenComponent, setSecondScreenComponent] = useState(null)
  const secondScreenOptions = {
    'new-map': NewMap,
    configuration: Configuration,
    credits: Credits,
  }
  const SecondScreen = secondScreenOptions[secondScreenComponent]

  const thirdScreenOptions = {
    'new-map': MapThirdScreen,
    configuration: ConfigurationThirdScreen,
  }
  const ThirdScreen = thirdScreenOptions[secondScreenComponent]

  // Menu to show on third screen
  // A string which identifies the third screen
  const [thirdScreenComponent, setThirdScreenComponentRaw] = useState(null)
  const setThirdScreenComponent = (value) =>
    setThirdScreenComponentRaw((currentValue) =>
      value == currentValue ? null : value
    )

  // Function to generate a callback that sets a state to a value
  const setSecondMenu = (value) =>
    setSecondScreenComponent((currentValue) => {
      if (value == currentValue) value = null
      setThirdScreenComponent(null)
      return value
    })

  const bindThirdMenu = (value) => () => setThirdScreenComponent(value)

  const closeCurtain = (newParams) => {
    setMapParams(newParams)
    setClosingCurtain(true)
  }

  // Returns the given string, and if the secondScreenComponent variable is equal to it, concatenates a space and the string 'active'
  const menuOptionClass = (className, compare) =>
    className + (className == compare ? ' active' : '')

  const startSimulation = () => {
    hideHomeScreen()

    IO.active = true

    Camera.wander = false

    Simulation.reset()

    Map.instance.generateMap(mapParams.method, mapParams.parameters)

    Simulation.centerCamera()

    Map.instance.music.volume *= 0.5
  }

  const hoverSFX = () => MenuSFX.playHover()

  const bindClick = (menu) => () => {
    setSecondMenu(menu)
    MenuSFX.playClick()
  }

  return (
    <div className="home-container">
      {/* Upper curtain */}
      <div
        onAnimationEnd={startSimulation}
        className={'upper-curtain' + (closingCurtain ? ' play' : '')}
      ></div>
      {/* Upper shadow */}
      <div className="upper-shadow"></div>

      {/* Main Title */}
      <h1>Cabber</h1>

      {/* Subtitle */}
      <h2>A taxi app simulation</h2>

      <div className="menus">
        {/* Main Menu */}
        <div
          className={
            'main menu' + (secondScreenComponent == null ? '' : ' faded')
          }
        >
          {/* Create new map */}
          <button
            onClick={bindClick('new-map')}
            onMouseEnter={hoverSFX}
            className={menuOptionClass('new-map', secondScreenComponent)}
          >
            New Map
          </button>

          {/* Access simulation options */}
          <button
            onClick={bindClick('configuration')}
            onMouseEnter={hoverSFX}
            className={menuOptionClass('configuration', secondScreenComponent)}
          >
            Configuration
          </button>

          {/* See credits */}
          <button
            onClick={bindClick('credits')}
            onMouseEnter={hoverSFX}
            className={menuOptionClass('credits', secondScreenComponent)}
          >
            Credits
          </button>
        </div>

        {/* Second screen */}
        {secondScreenComponent != null && (
          <div
            className={
              'second menu' + (thirdScreenComponent == null ? '' : ' faded')
            }
          >
            <IoIosArrowBack className="back icon" onClick={bindClick(null)} />

            {/* Show component if there is one */}
            <SecondScreen
              setNextMenu={setThirdScreenComponent}
              menuOptionClass={(name) =>
                menuOptionClass(name, thirdScreenComponent)
              }
            />
          </div>
        )}

        {/* Third screen */}
        {thirdScreenComponent != null && (
          <div className="third menu">
            <IoIosArrowBack
              className="back icon"
              onClick={bindThirdMenu(null)}
            />

            {/* Show component if there is one */}
            <ThirdScreen
              startSimulation={closeCurtain}
              configuration={mapParamsConfiguration[thirdScreenComponent]}
              owner={thirdScreenComponent}
            />
          </div>
        )}
      </div>

      <p className="mobile-alert">
        Please, open the app in a desktop to enable interactivity
      </p>
    </div>
  )
}
