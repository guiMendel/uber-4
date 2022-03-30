import { useEffect, useState } from 'react'

import {
  FaCaretLeft,
  FaCaretRight,
  FaCarSide,
  FaLongArrowAltRight,
  FaUserTie,
  FaMapMarkerAlt,
} from 'react-icons/fa'

// Um componente com a interface para configurar a criacao de nvoas ruas
export default function ClientRouteControl() {
  useEffect(() => {}, [])

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
}
