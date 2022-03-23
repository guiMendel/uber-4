// Fornece uma interface que se asocia a um botao e dispara um evento sempre que ele eh selecionado
export default class ButtonReference {
  listeners = []

  // Permite observar o clique
  onTrigger(callback) {
    this.listeners.push(callback)
  }

  // Permite levantar o evento
  trigger() {
    for (const listener of this.listeners) listener()
  }
}
