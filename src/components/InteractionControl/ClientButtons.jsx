import { MdEditLocationAlt } from 'react-icons/md'
import { FaCar, FaUser, FaSearchLocation } from 'react-icons/fa'
import Button from '../Button/Button'

export default function ClientButtons() {
  return (
    <div className="client actions">
      <Button
        name={'change-destination'}
        help={'Alterar destino'}
        isSwitch
        rigthTooltip
      >
        <MdEditLocationAlt />
      </Button>

      <Button
        name={'center-destination'}
        help={'Centralizar tela no destino'}
        rigthTooltip
      >
        <FaSearchLocation />
      </Button>

      <Button
        name={'center-client'}
        help={'Centralizar tela no cliente'}
        rigthTooltip
      >
        <div className="search-client">
          <FaSearchLocation className="glass" />
          <FaUser className="client" />
        </div>
      </Button>

      <Button name={'select-route'} help={'Encontrar uma rota'} rigthTooltip>
        <FaCar />
      </Button>
    </div>
  )
}
