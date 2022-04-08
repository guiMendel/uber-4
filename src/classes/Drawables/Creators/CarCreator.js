import appConfig from '../../../configuration/appConfig'
import theme from '../../../configuration/theme'
import { findFittest, unorderedFindFittest } from '../../../helpers/search'
import IO from '../../IO'
import Map from '../../Map'
import Car from '../Car'
import Edge from '../Edge'
import Creator from './Creator'

const { highlightColor, streetWidth } = theme
const { maxCarSnapDistance } = appConfig

const eraseCarsToken = 'erase-cars'

// Classe que permite criar novos carros
export default class CarCreator extends Creator {
  // Reflete o estado do botao de apagar carros
  eraseCars = { isActive: false, set: null }

  // Posicao na qual criar o carro
  carPosition = { x: null, y: null, edge: null }

  constructor() {
    super()

    // Quando o mouse mover, atualiza a posicao do carro
    IO.addEventListener('mousemove', (movement) =>
      this.setCarPosition(movement)
    )

    // Ouve botao de apagar carros
    IO.addButtonListener('delete-cars', ({ value, setValue }) => {
      // Inicia o modo apagar carros

      // Se ja possui um set
      if (this.eraseCars.set != null) this.eraseCars.set(value)
      // Do contrario, inicializa o set
      else {
        IO.addCancelCallback(eraseCarsToken, () => this.eraseCars.set(false))

        this.eraseCars.isActive = value
      }

      this.eraseCars.set = (newValue) => {
        if (newValue == false && this.eraseCars.isActive) {
          IO.removeCancelCallback(eraseCarsToken)
        } else if (newValue == true && this.eraseCars.isActive == false) {
          IO.addCancelCallback(eraseCarsToken, () => this.eraseCars.set(false))
        }

        this.eraseCars.isActive = newValue
        setValue(newValue)
      }
    })
  }

  setCarPosition({ mapPosition: mouse }) {
    if (!this.constructor.isActive) return

    const maxDistance = maxCarSnapDistance + streetWidth / 2

    // Pega as 4 listas ordenadas
    const leftSorted = Edge.sortedCoords.get('leftVertexX')
    const rightSorted = Edge.sortedCoords.get('rightVertexX')
    const upperSorted = Edge.sortedCoords.get('upperVertexY')
    const lowerSorted = Edge.sortedCoords.get('lowerVertexY')

    // Filtra as listas de x

    // Encontra as arestas cujo vertice da esquerda esta para a esquerda do cursor
    const leftBounded = findFittest(
      leftSorted,
      (edge) => Math.max(0, edge.leftVertex.x - mouse.x - streetWidth / 2),
      maxDistance
    )

    // Encontra as arestas cujo vertice da direita esta para a direita do cursor
    const rightBounded = findFittest(
      rightSorted,
      (edge) => Math.min(0, edge.rightVertex.x - mouse.x + streetWidth / 2),
      maxDistance
    )

    // Encontra as arestas cujo vertice de cima esta para cima do cursor
    // Lembrando q y cresce para baixo
    const upperBounded = findFittest(
      upperSorted,
      (edge) => Math.max(0, edge.upperVertex.y - mouse.y - streetWidth / 2),
      maxDistance
    )

    // Encontra as arestas cujo vertice de baixo esta para baixo do cursor
    // Lembrando q y cresce para baixo
    const lowerBounded = findFittest(
      lowerSorted,
      (edge) => Math.min(0, edge.lowerVertex.y - mouse.y + streetWidth / 2),
      maxDistance
    )

    const boundArray = [leftBounded, rightBounded, upperBounded, lowerBounded]
    const sortedArrays = [leftSorted, rightSorted, upperSorted, lowerSorted]

    // Encontra qual das 4 listas de arestas tem menos arestas (i.e. o menor intervalo de indices)
    const shortestIntervalIndex = unorderedFindFittest(
      boundArray,
      // Se for um vetor vazio, ele deve ter prioridade
      (interval) => (interval[1] != undefined ? interval[1] - interval[0] : 0),
      null,
      null,
      // Esse parametro solicite que retorne o indice
      true
    )

    // Buscando dentro deste intervalo somente, encontramos qual aresta esta mais proxima do mouse
    const closestEdge = unorderedFindFittest(
      sortedArrays[shortestIntervalIndex],
      (edge) => edge.getProjectionDistanceSquared(mouse),
      Math.pow(maxDistance, 2),
      boundArray[shortestIntervalIndex]
    )

    this.carPosition.edge = closestEdge

    if (closestEdge == null) return

    // Pega as coordenadas da projecao
    Object.assign(this.carPosition, closestEdge.getProjectionCoordinates(mouse))
  }

  onDraw(drawer) {
    if (this.carPosition.edge == null) return

    const { drawImage, frettedPath } = drawer.drawWith({
      opacity: 0.5,
      style: highlightColor,
      lineWidth: 10,
    })

    // No modo apagar, desenha diferente
    if (this.eraseCars.isActive) {
      return
    }

    // Desenha a imagem do carro
    drawImage(
      Map.instance.carImage,
      this.carPosition,
      this.carPosition.edge.angle - 90
    )

    // Desenha trastejado ate o carro
    frettedPath({ gap: 15, length: 15 }, IO.mouse.mapCoords, this.carPosition)
  }

  onCancel() {
    this.carPosition = { x: null, y: null }

    if (this.eraseCars.set) this.eraseCars.set(false)
  }

  handleClick(position) {
    // No modo apagar
    if (this.eraseCars.isActive) {
      // Verifica se o cursor esta sobre um carro
      const { mapCoords: mouse } = IO.mouse

      // Distancia maxima para ocorrer o hover
      const maxDistance = Map.instance.carImage.width + 3

      const xSortedCars = Car.sortedCoords.get('x')

      // Entre os carros, encontra os mais proximos em x
      const closestByXInterval = findFittest(
        xSortedCars,
        (car) => car.x - mouse.x,
        maxDistance
      )

      // Encontra um carro proximo o suficiente em y tambem
      const deleteCar = unorderedFindFittest(
        // Mapeia os indices em carros
        xSortedCars,
        (car) => car.y - mouse.y,
        maxDistance,
        closestByXInterval
      )

      // Verifica se encontrou um carro
      if (deleteCar == null) return

      deleteCar.destroy()
      return
    }

    if (this.carPosition.edge == null) return

    // Cria o carro
    new Car(
      undefined,
      this.carPosition.edge,
      this.carPosition.x,
      this.carPosition.y
    )
  }
}
