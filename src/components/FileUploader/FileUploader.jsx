import Button from '../Button/Button'
import { useEffect, useRef, useState } from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'
import './FileUploader.css'
import Map from '../../classes/Map'

export default function FileUploader({ show, hide, parser }) {
  const input = useRef()

  // Conteudo do textarea
  const [content, setContent] = useState('')

  // Sempre que aparecer, se seleciona
  useEffect(() => {
    if (show) {
      input.current.select()
    }
  }, [show])

  // Lida com o drop de um file
  function handleDrop(event) {
    // Pega o arquivo
    uploadFile(event.dataTransfer.files[0])

    event.stopPropagation()
    event.preventDefault()
  }

  function handleFileInputChange({ target }) {
    uploadFile(target.files[0])
  }

  function uploadFile(file) {
    // Cria um leitor
    const reader = new FileReader()

    // Configura o leitor
    reader.onerror = () => {
      throw new Error('Failed to read file')
    }

    reader.onloadend = () => setContent(reader.result)

    // Comeca a ler o arquivo
    reader.readAsText(file, 'UTF-8')
  }

  function accept() {
    try {
      parser(content)
    } catch (error) {
      Map.announceError(error)
    }

    hide()
    setContent('')
  }

  return (
    <div className={`file-uploader ${show ? '' : 'hide'}`} onDrop={handleDrop}>
      <p className="inform">
        <label htmlFor="file">Upload</label>
        <input
          id="file"
          type="file"
          accept=".txt"
          onChange={handleFileInputChange}
        />
        or drag the file to this panel
      </p>

      <textarea
        ref={input}
        spellCheck={false}
        value={content}
        onChange={(event) => setContent(event.target.value)}
      ></textarea>

      <Button
        name="submit-file"
        className="custom-button submit"
        onClick={accept}
      >
        <FaCheck />
      </Button>

      <Button
        name="cancel-file-upload"
        className="custom-button cancel"
        onClick={hide}
      >
        <FaTimes />
      </Button>
    </div>
  )
}
