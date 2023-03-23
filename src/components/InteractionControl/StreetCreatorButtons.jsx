import { useState } from 'react'
import { FaEraser, FaFileExport } from 'react-icons/fa'
import FileParser from '../../classes/FileParser'
import Button from '../Button/Button'
import FileUploader from '../FileUploader/FileUploader'

export default function StreetCreatorButtons() {
  // Se eh ou nao pra mostrar o painel de subir arquivos
  const [showUploadPanel, setShowUploadPanel] = useState(false)

  return (
    <div className="client actions">
      <Button
        name={'upload-streets'}
        onClick={() => setShowUploadPanel(!showUploadPanel)}
        help={'Read streets from file'}
        rightTooltip
      >
        <FaFileExport />
      </Button>

      <Button
        name={'delete-streets'}
        help={'Erase streets'}
        isSwitch
        rightTooltip
      >
        <FaEraser />
      </Button>

      <FileUploader
        show={showUploadPanel}
        hide={() => setShowUploadPanel(false)}
        parser={FileParser.parseStreets}
      />
    </div>
  )
}
