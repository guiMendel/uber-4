import { FaEraser } from 'react-icons/fa'
import Button from '../Button/Button'

export default function ClientCreatorButtons() {
  return (
    <div className="client actions">
      <Button
        name={'delete-clients'}
        help={'Apagar clientes'}
        isSwitch
        rigthTooltip
      >
        <FaEraser />
      </Button>
    </div>
  )
}
