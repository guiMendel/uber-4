import { useCallback, useEffect, useState } from 'react'

import {
  FaCaretLeft,
  FaCaretRight,
  FaCarSide,
  FaLongArrowAltRight,
  FaUserTie,
  FaMapMarkerAlt,
} from 'react-icons/fa'
import Client from '../../classes/Drawables/Client'
import RouteCalculator from '../../classes/RouteCalculator'
import appConfig from '../../configuration/appConfig'
import theme from '../../configuration/theme'
import { getDistance } from '../../helpers/vectorDistance'

const { selectedRouteHighlight, selectedRouteHighlightBeforeRdv } = theme
const { pixelsPerKilometer } = appConfig

// Um componente com a interface para configurar a criacao de nvoas ruas
export default function ClientRouteControl() {
  // Qual o cliente selecionado
  const [selectedClient, setSelectedClient] = useState(null)

  // Qual a rota do cliente selecionado
  const [routes, setRoutes] = useState(null)

  const handleRouteCalculation = ({ client, routes: newRoutes }) => {
    setRoutes(newRoutes)

    // Ja seleciona a melhor rota para este cliente
    client.selectedRoute = newRoutes[0]

    // Como React eh uma bosta, precisa dar set no null antes pra ele dar rerender
    setSelectedClient(null)
    setSelectedClient(client)
  }

  useEffect(() => {
    // Inicializa o cliente
    setSelectedClient(Client.selected)

    // Se inscreve para selecao de cliente
    Client.addEventListener('select', setSelectedClient)

    // Se inscreve para calculo de rota
    RouteCalculator.addEventListener('calculateroutes', handleRouteCalculation)

    return () => {
      // Se desinscreve
      Client.removeEventListener('select', setSelectedClient)
      RouteCalculator.removeEventListener(
        'calculateroutes',
        handleRouteCalculation
      )
    }
  }, [])

  // Pega as distancias
  const getClientToDestinationKm = useCallback((route) => {
    // Ja soma os km do fim da rota
    let totalKm = getDistance(route.edge.source, route.projectionCoords)
    route = route.parent

    while (route != null) {
      if (route.source != null)
        totalKm += getDistance(route.source, route.edge.destination)
      else totalKm += route.edge.mapDistance
      route = route.parent
    }

    return totalKm / pixelsPerKilometer
  })

  const getCarToClientKm = useCallback((route) => {
    // Pega a rota antecessora
    route = route.stepper.parentNode

    return getClientToDestinationKm(route)
  })

  return (
    <div
      className="interaction-control"
      style={{
        '--section1': selectedRouteHighlightBeforeRdv,
        '--section2': selectedRouteHighlight,
      }}
    >
      {/* Titulo */}
      <h1>Rota Selecionada</h1>

      {selectedClient?.selectedRoute != null ? (
        <div className="route-info-container">
          {/* Seta para esquerda */}
          <FaCaretLeft className="arrow" />

          {/* Informacoes da rota */}
          <div className="route-distances">
            {/* Distancias das secoes */}
            <div className="sections">
              {/* Carro ao cliente */}
              <span className="car-to-client">
                <FaCarSide className="car-icon" /> <FaLongArrowAltRight />{' '}
                <FaUserTie />{' '}
                <b>
                  {getCarToClientKm(selectedClient.selectedRoute).toFixed(2)} km
                </b>
              </span>

              {/* Cliente ao destino */}
              <span className="client-to-destination">
                <FaUserTie /> <FaLongArrowAltRight /> <FaMapMarkerAlt />{' '}
                <b>
                  {getClientToDestinationKm(
                    selectedClient.selectedRoute
                  ).toFixed(2)}{' '}
                  km
                </b>
              </span>
            </div>

            {/* Distancia total */}
            <span className="total">
              {(
                getCarToClientKm(selectedClient.selectedRoute) +
                getClientToDestinationKm(selectedClient.selectedRoute)
              ).toFixed(2)}{' '}
              km
            </span>
          </div>

          {/* Seta para direita */}
          <FaCaretRight className="arrow" />
        </div>
      ) : (
        <p>Usando Rota Automática</p>
      )}
    </div>
  )
}
