import { FaCar } from 'react-icons/fa'
import Button from '../Button/Button'

export default function ClientButtons() {
  return (
    <div className="client actions">
      <Button name={'select-route'} help={'Encontrar uma rota'} rigthTooltip>
        <FaCar />
      </Button>
    </div>
  )
}
