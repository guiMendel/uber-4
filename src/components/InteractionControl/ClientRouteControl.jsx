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
const { pixelsPerKilometer, clientWalkSpeed } = appConfig

// Um componente com a interface para configurar a criacao de nvoas ruas
export default function ClientRouteControl() {
  // Qual o cliente selecionado
  const [selectedClient, setSelectedClient] = useState(null)

  // Qual as rotas do cliente selecionado
  const [routes, setRoutes] = useState(null)

  // O indice da rota selecionada
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(-1)

  const handleRouteCalculation = ({ client, routes: newRoutes }) => {
    newRoutes.push('walk')

    // Adiciona a rota de caminhada
    setRoutes(newRoutes)

    // Ja seleciona a melhor rota para este cliente
    client.selectedRoute = newRoutes[0]
    setSelectedRouteIndex(0)

    // Como React eh uma bosta, precisa dar set no null antes pra ele dar rerender
    setSelectedClient(null)
    setSelectedClient(client)
  }

  const handleClientChange = (client) => {
    setRoutes(null)
    setSelectedClient(client)
  }

  useEffect(() => {
    // Inicializa o cliente
    setSelectedClient(Client.selected)

    // Se inscreve para selecao de cliente
    Client.addEventListener('select', handleClientChange)

    // Se inscreve para calculo de rota
    RouteCalculator.addEventListener('calculateroutes', handleRouteCalculation)

    return () => {
      // Se desinscreve
      Client.removeEventListener('select', handleClientChange)
      RouteCalculator.removeEventListener(
        'calculateroutes',
        handleRouteCalculation
      )
    }
  }, [])

  // const getClientToDestinationKm = useCallback((route) => {
  //   // Ja soma os km do fim da rota
  //   let totalKm = getDistance(route.edge.source, route.projectionCoords)

  //   // Se tem uma distancia real, usa a proporcao dela
  //   if (route.edge.realDistance != null)
  //     totalKm = (totalKm / route.edge.mapDistance) * route.edge.realDistance

  //   route = route.parent

  //   while (route != null) {
  //     // Se tem um source
  //     if (route.source != null) {
  //       const mapSectionDistance = getDistance(
  //         route.source,
  //         route.edge.destination
  //       )

  //       // Se tiver uma distancia real, usa a proporcao
  //       if (route.edge.realDistance)
  //         totalKm +=
  //           (mapSectionDistance / route.edge.mapDistance) *
  //           route.edge.realDistance
  //       else totalKm += mapSectionDistance / pixelsPerKilometer
  //     }

  //     // Preferencia para a distancia real
  //     else if (route.edge.realDistance) totalKm += route.edge.realDistance
  //     else totalKm += route.edge.mapDistance / pixelsPerKilometer

  //     // Avanca o node
  //     route = route.parent
  //   }

  //   return totalKm / pixelsPerKilometer
  // })

  const getTotalDistance = (route) => {
    if (route == 'walk')
      return (
        getDistance(selectedClient, selectedClient.destination) /
        pixelsPerKilometer
      )

    return getCarToClientKm(route) + getClientToDestinationKm(route)
  }

  // Pega as distancias
  const getClientToDestinationKm = useCallback((route) => {
    if (route == 'walk') return null

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
    route = route.stepper?.parentNode ?? 'walk'

    return getClientToDestinationKm(route)
  })

  const getTimeCost = (route) => {
    let totalCost = selectedClient.selectedRoute.totalCost

    // Se for caminhando, considera o custo de caminhar
    if (totalCost == null)
      totalCost =
        getDistance(selectedClient, selectedClient.destination) /
        pixelsPerKilometer /
        clientWalkSpeed

    const hours = Math.floor(totalCost)

    return `${hours}h${Math.floor((totalCost - hours) * 60).toLocaleString(
      'pt-BR',
      {
        minimumIntegerDigits: 2,
        useGrouping: false,
      }
    )}`
  }

  // Permite alterar entre as rotas
  const alterRouteIndex = (indexChange) => {
    if (routes == null) return

    const newIndex = selectedRouteIndex + indexChange

    // Caso exceda o limite de rotas
    if (newIndex >= routes.length) return

    // Caso vire um numero negativo
    if (newIndex < 0) {
      const client = selectedClient

      setSelectedRouteIndex(-1)

      // Desseleciona a rota
      client.selectedRoute = null

      // Obriga react a rerender
      setSelectedClient(null)
      setSelectedClient(client)
      return
    }

    // Casos normais
    setSelectedRouteIndex(newIndex)
    selectedClient.selectedRoute = routes[newIndex]
  }

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

      <div className="route-info-container">
        {/* Seta para esquerda */}
        <FaCaretLeft
          className={`arrow ${
            (selectedClient?.selectedRoute == null || routes == null) &&
            'disabled'
          }`}
          onClick={() => alterRouteIndex(-1)}
        />

        {/* Informacoes da rota */}
        {selectedClient?.selectedRoute != null ? (
          <div className="route-distances">
            {/* Distancias das secoes */}
            <div className="sections">
              {/* Carro ao cliente */}
              <span className="car-to-client">
                <FaCarSide className="car-icon" /> <FaLongArrowAltRight />{' '}
                <FaUserTie />{' '}
                <b>
                  {getCarToClientKm(selectedClient.selectedRoute)?.toFixed(2) ??
                    '-'}{' '}
                  km
                </b>
              </span>

              {/* Cliente ao destino */}
              <span className="client-to-destination">
                <FaUserTie /> <FaLongArrowAltRight /> <FaMapMarkerAlt />{' '}
                <b>
                  {getClientToDestinationKm(
                    selectedClient.selectedRoute
                  )?.toFixed(2) ?? '-'}{' '}
                  km
                </b>
              </span>
            </div>

            {/* Distancia total */}
            <span className="total">
              {getTotalDistance(selectedClient.selectedRoute).toFixed(2)} km,{' '}
              {getTimeCost(selectedClient.selectedRoute)}
            </span>
          </div>
        ) : (
          <p>Usando Rota Automática</p>
        )}

        {/* Seta para direita */}
        <FaCaretRight
          className={`arrow ${
            (routes == null || selectedRouteIndex == routes.length - 1) &&
            'disabled'
          }`}
          onClick={() => alterRouteIndex(1)}
        />
      </div>
    </div>
  )
}
