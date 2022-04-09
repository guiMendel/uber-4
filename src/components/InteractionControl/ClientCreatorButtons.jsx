import { useState } from 'react'
import { FaEraser, FaFileExport } from 'react-icons/fa'
import FileParser from '../../classes/FileParser'
import Button from '../Button/Button'
import FileUploader from '../FileUploader/FileUploader'

export default function ClientCreatorButtons() {
  // Se eh ou nao pra mostrar o painel de subir arquivos
  const [showUploadPanel, setShowUploadPanel] = useState(false)

  return (
    <div className="client actions">
      <Button
        name={'upload-clients'}
        onClick={() => setShowUploadPanel(!showUploadPanel)}
        help={'Ler clientes de arquivo'}
        rigthTooltip
      >
        <FaFileExport />
      </Button>

      <Button
        name={'delete-clients'}
        help={'Apagar clientes'}
        isSwitch
        rigthTooltip
      >
        <FaEraser />
      </Button>

      <FileUploader
        show={showUploadPanel}
        hide={() => setShowUploadPanel(false)}
        parser={FileParser.parseClients}
      />
    </div>
  )
}
