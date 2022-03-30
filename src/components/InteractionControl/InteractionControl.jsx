import { useEffect, useState } from 'react'
import StreetCreator from '../../classes/Drawables/Creators/StreetCreator'
import StreetCreatorControl from './StreetCreatorControl'

import Map from '../../classes/Map'

import './InteractionControl.css'
import Client from '../../classes/Drawables/Client'
import ClientRouteControl from './ClientRouteControl'

// Mapeia as interaction keys com componentes
const interactionKeyMap = {
  [StreetCreator.name]: StreetCreatorControl,
  [Client.name]: ClientRouteControl,
}

// Este componente decide qual dos outros controls mostrar, baseado em qual classe de interacao esta ativa
export default function InteractionControl() {
  // Guarda a chave de qual componente mostrar
  const [interactionKey, setInteractionKey] = useState(null)

  useEffect(() => {
    // Se inscreve para o evento de mudanca de classe de interacao
    Map.addEventListener('activateinteractionclass', ({ value }) =>
      setInteractionKey(value?.name)
    )
  }, [])

  const InteractionComponent = interactionKeyMap[interactionKey]

  if (interactionKey != null && InteractionComponent != null)
    return (
      <div className="map-interaction-control">
        <InteractionComponent />
      </div>
    )
  else return null
}
