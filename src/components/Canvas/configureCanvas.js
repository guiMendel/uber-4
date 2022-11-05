// Configura o canvas: ajusta seu tamanho e o faz mudar de tamanho automaticamente conforme necessario
export default function configureCanvas(canvas) {
  // Configura as dimensoes
  const adjustDimensions = () => {
    canvas.height = window.innerHeight
    canvas.width = window.innerWidth
  }

  // Ajustar imediatamente
  adjustDimensions()

  // Ajustar tamanho automaticamente quando a tela mudar de tamanho
  window.addEventListener('resize', adjustDimensions)
}
