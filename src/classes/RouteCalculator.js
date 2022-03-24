import IO from './IO'
import getBestRoutesFor from '../modules/getBestRoutesFor'
import Client from './Drawables/Client'

// Fornece a classe responsavel por saber quando e como calcular as rotas dos clientes, e o que fazer depois
export default class RouteCalculator {
  static setup() {
    // Observa a selecao do botao de calcular rota
    IO.buttons['select-route'].onTrigger(this.calculate)
  }

  // Faz o caluclo das melhores rotas para o cliente selecionado, e destaca elas em tela
  static calculate() {
    if (Client.selected == null) return

    getBestRoutesFor(Client.selected).then(console.log).catch(console.error)
  }
}
