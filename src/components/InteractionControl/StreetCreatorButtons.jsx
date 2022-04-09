import { useState } from 'react'
import { FaEraser, FaFileExport } from 'react-icons/fa'
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
        help={'Ler ruas de arquivo'}
        rigthTooltip
      >
        <FaFileExport />
      </Button>

      <Button
        name={'delete-streets'}
        help={'Apagar ruas'}
        isSwitch
        rigthTooltip
      >
        <FaEraser />
      </Button>

      <FileUploader
        show={showUploadPanel}
        hide={() => setShowUploadPanel(false)}
      />
    </div>
  )
}
