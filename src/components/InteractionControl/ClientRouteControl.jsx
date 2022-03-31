import { useEffect, useState } from 'react'

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

// Um componente com a interface para configurar a criacao de nvoas ruas
export default function ClientRouteControl() {
  // Qual o cliente selecionado
  const [selectedClient, setSelectedClient] = useState(null)

  // Qual a rota do cliente selecionado
  const [routes, setRoutes] = useState(null)

  function handleRouteCalculation({ client, routes: newRoutes }) {
    setRoutes(newRoutes)
    setSelectedClient(client)

    // Ja seleciona a melhor rota para este cliente
    client.selectedRoute = newRoutes[0]
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

  if (selectedClient != null)
    return (
      <div className="interaction-control">
        {/* Titulo */}
        <p>Rota Selecionada</p>

        {/* Area de controle */}
        <div className="route-info-container">
          {/* Seta para esquerda */}
          <FaCaretLeft className="arrow" />

          {/* Informacoes da rota */}
          <div className="route-distances">
            {/* Distancias das secoes */}
            <div className="sections">
              {/* Carro ao cliente */}
              <span>
                <FaCarSide className="car-icon" /> <FaLongArrowAltRight />{' '}
                <FaUserTie /> <b>27 km</b>
              </span>

              {/* Cliente ao destino */}
              <span>
                <FaUserTie /> <FaLongArrowAltRight /> <FaMapMarkerAlt />{' '}
                <b>134 km</b>
              </span>
            </div>

            {/* Distancia total */}
            <span className="total">161 km</span>
          </div>

          {/* Seta para direita */}
          <FaCaretRight className="arrow" />
        </div>
      </div>
    )

  return null
}
