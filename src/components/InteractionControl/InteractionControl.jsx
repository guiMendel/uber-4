import { useEffect, useState } from 'react'
import StreetCreator from '../../classes/Drawables/Creators/StreetCreator'
import StreetCreatorControl from './StreetCreatorControl'
import StreetCreatorButtons from './StreetCreatorButtons'

import Map from '../../classes/Map'

import './InteractionControl.css'
import Client from '../../classes/Drawables/Client'
import ClientRouteControl from './ClientRouteControl'
import ClientButtons from './ClientButtons'
import ClientCreator from '../../classes/Drawables/Creators/ClientCreator'
import ClientCreatorButtons from './ClientCreatorButtons'

// Mapeia as interaction keys com componentes
const interactionKeyMap = {
  [StreetCreator.name]: StreetCreatorControl,
  [Client.name]: ClientRouteControl,
}

const buttonPanelsKeyMap = {
  [ClientCreator.name]: ClientCreatorButtons,
  [StreetCreator.name]: StreetCreatorButtons,
  [Client.name]: ClientButtons,
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
  const ButtonPanelComponent = buttonPanelsKeyMap[interactionKey]

  if (interactionKey != null)
    return (
      <>
        {InteractionComponent != null && (
          <div className="map-interaction-control">
            <InteractionComponent />
          </div>
        )}

        {ButtonPanelComponent != null && (
          <div className="button-panel-control">
            <ButtonPanelComponent />
          </div>
        )}
      </>
    )
  else return null
}
