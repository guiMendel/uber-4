// Faz uma rotina async esperar o tempo fornecido em segundos antes de prosseguir
export default function delay(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}
