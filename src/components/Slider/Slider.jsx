import './slider.css'
import { useRef } from 'react'
import { useEffect } from 'react'

let handlerCache = null

export default function Slider({ value, setValue, min, max }) {
  // Reference to track element
  const trackElement = useRef(null)

  // Sets the value but clamps it beforehand
  const setValueStable = (newValue) =>
    setValue(Math.max(Math.min(max, Math.round(parseFloat(newValue))), min))

  const handleClick = (event) => {
    // Get bounding box of track
    const trackBox = trackElement.current.getBoundingClientRect()

    // Proportion of pointer relative to start & end
    const pointerPositionRelative =
      (event.clientX - trackBox.x) / trackBox.width

    // Set value according to this new relative value
    setValueStable((max - min) * pointerPositionRelative + min)
  }

  const handleMouseDown = (event) => {
    if (handlerCache != null) {
      window.removeEventListener('mousemove', handlerCache)
    }

    handlerCache = handleClick
    window.addEventListener('mousemove', handleClick)
    handleClick(event)
  }

  useEffect(() => {
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handlerCache)
    }

    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handlerCache)
    }
  }, [])

  return (
    <div className="slider">
      <input
        value={value}
        onChange={(event) => setValueStable(event.target.value)}
        type="number"
      />

      <div className="track" onMouseDown={handleMouseDown} ref={trackElement}>
        <div
          className="handle"
          style={{ '--position': `${((value - min) / (max - min)) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}
