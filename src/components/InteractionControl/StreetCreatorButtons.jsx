import { FaEraser } from 'react-icons/fa'
import Button from '../Button/Button'

export default function StreetCreatorButtons() {
  return (
    <div className="client actions">
      <Button
        name={'delete-streets'}
        help={'Apagar ruas'}
        isSwitch
        rigthTooltip
      >
        <FaEraser />
      </Button>
    </div>
  )
}
