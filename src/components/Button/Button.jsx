import './Button.css'

// Componente de botao que automaticamente se inscreve em buttons de IO
export default function Button({ children }) {
  return <button className="custom-button">{children}</button>
}
