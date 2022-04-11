import { useEffect, useState } from 'react'
import Map from '../../classes/Map'
import appConfig from '../../configuration/appConfig'
import { BiMessageSquareError } from 'react-icons/bi'
import './ErrorDisplay.css'

const { errorMessageDuration } = appConfig

// Vai guardar o id de cada erro
let errorIdCounter = 0

export default function ErrorDisplay() {
  // Vai guardar todos os erros que estao aparecendo
  const [errors, setErrors] = useState({})

  function addError(error) {
    const errorId = errorIdCounter++

    // Adiciona uma entrada para esse erro
    setErrors((errors) => {
      return {
        ...errors,
        [errorId]: error,
      }
    })

    // Prepara um callback para apagar esse erro
    setTimeout(() => removeError(errorId), errorMessageDuration * 1000)
  }

  function removeError(id) {
    setErrors((errors) => {
      delete errors[id]

      return { ...errors }
    })
  }

  useEffect(() => {
    // Ouve o lancamento de erros no mapa
    Map.addEventListener('error', addError)
  }, [])

  return (
    <div className="error-display">
      {Object.entries(errors).map(([id, error]) => (
        <span className="error-entry" onClick={() => removeError(id)} key={id}>
          <BiMessageSquareError className="icon" /> {error}
        </span>
      ))}
    </div>
  )
}
