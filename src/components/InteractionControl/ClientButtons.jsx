import { MdEditLocationAlt } from 'react-icons/md'
import { FaCar, FaUser, FaSearchLocation } from 'react-icons/fa'
import Button from '../Button/Button'

export default function ClientButtons() {
  return (
    <div className="client actions">
      <Button
        name={'change-destination'}
        help={'Alter destination'}
        isSwitch
        rightTooltip
      >
        <MdEditLocationAlt />
      </Button>

      <Button
        name={'center-destination'}
        help={'Center screen on destination'}
        rightTooltip
      >
        <FaSearchLocation />
      </Button>

      <Button
        name={'center-client'}
        help={'Center screen on client'}
        rightTooltip
      >
        <div className="search-client">
          <FaSearchLocation className="glass" />
          <FaUser className="client" />
        </div>
      </Button>

      <Button name={'select-route'} help={'Find a route'} rightTooltip>
        <FaCar />
      </Button>
    </div>
  )
}
