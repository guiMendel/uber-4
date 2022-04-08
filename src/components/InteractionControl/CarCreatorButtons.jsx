import { FaEraser } from 'react-icons/fa'
import Button from '../Button/Button'

export default function CarCreatorButtons() {
  return (
    <div className="client actions">
      <Button
        name={'delete-cars'}
        help={'Apagar carros'}
        isSwitch
        rigthTooltip
      >
        <FaEraser />
      </Button>
    </div>
  )
}
