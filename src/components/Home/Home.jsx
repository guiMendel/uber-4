import React, { useState } from 'react'
import './home.css'
import NewMap from './NewMap/NewMap'
import Configuration from './Configuration/Configuration'
import Credits from './Credits/Credits'
import { IoIosArrowBack } from 'react-icons/io'
import mapParamsConfiguration from './mapParamsConfiguration'
import Slider from '../Slider/Slider'
import ThirdScreen from './ThirdScreen/ThirdScreen'

export default function Home({ startSimulation, setMapParams }) {
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

  // Menu to show on third screen
  // A string which identifies the third screen
  const [thirdScreenComponent, setThirdScreenComponentRaw] = useState(null)
  const setThirdScreenComponent = (value) =>
    setThirdScreenComponentRaw((currentValue) =>
      value == currentValue ? null : value
    )

  // Function to generate a callback that sets a state to a value
  const bindSecondMenu = (value) => () =>
    setSecondScreenComponent((currentValue) => {
      if (value == currentValue) value = null
      setThirdScreenComponent(null)
      return value
    })

  const bindThirdMenu = (value) => () => setThirdScreenComponent(value)

  const closeCurtain = (mapParams) => {
    setMapParams(mapParams)
    setClosingCurtain(true)
  }

  // Returns the given string, and if the secondScreenComponent variable is equal to it, concatenates a space and the string 'active'
  const menuOptionClass = (className, compare) =>
    className + (className == compare ? ' active' : '')

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
            onClick={bindSecondMenu('new-map')}
            className={menuOptionClass('new-map', secondScreenComponent)}
          >
            New Map
          </button>

          {/* Access simulation options */}
          <button
            onClick={bindSecondMenu('configuration')}
            className={menuOptionClass('configuration', secondScreenComponent)}
          >
            Configuration
          </button>

          {/* See credits */}
          <button
            onClick={bindSecondMenu('credits')}
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
            <IoIosArrowBack
              className="back icon"
              onClick={bindSecondMenu(null)}
            />

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
    </div>
  )
}
