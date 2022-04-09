import Camera from './Camera'
import Edge from './Drawables/Edge'
import Vertex from './Drawables/Vertex'

// Este arquivo interpreta o conteudo de um arquivo e adiciona as entidades correspondentes
export default class FileParser {
  static parseStreets(fileData) {
    // Separa as linhas e o header
    const [header, ...lines] = fileData.split('\n')

    // Guarda a ordem em que as propriedades serao definidas
    const propertyOrder = []

    // Define qual nome no cabcealho corresponde a cada propriedade da aresta
    const headerTransaltor = {
      aresta_n: 'id',
      v_origem: 'sourceId',
      loc_v_origem_x: 'sourceX',
      loc_v_origem_y: 'sourceY',
      v_destino: 'destinationId',
      loc_v_destino_x: 'destinationX',
      loc_v_destino_y: 'destinationY',
      'dist.ncia_km': 'length',
      velocidade_km_h: 'speed',
    }

    // Le o cabecalho para entender qual a ordem dos dados
    for (let headerPiece of header.split(/\s/)) {
      if (!headerPiece) continue

      // Pega anomalias com acentos
      if (/dist.ncia_km/i.test(headerPiece)) headerPiece = 'dist.ncia_km'

      propertyOrder.push(headerTransaltor[headerPiece.toLowerCase()])
    }

    // Vai guardar os prototipos de aresta a serem gerados
    const prototypes = []

    // Para cada linha
    for (const line of lines) {
      // Pega os numeros isolados
      const numbers = line.split(/\s/)

      // Cria o prototipo
      const prototype = {}

      // Passa por cada propriedade
      for (const [index, property] of Object.entries(propertyOrder)) {
        // Adiciona a propriedade
        prototype[property] = numbers[index]
      }

      prototypes.push(prototype)
    }

    let lastEdge

    // Para cada prototipo
    for (const prototype of prototypes) {
      // Cria os vertices
      const source = new Vertex(
        prototype.sourceId,
        prototype.sourceX,
        prototype.sourceY,
        false
      )

      const destination = new Vertex(
        prototype.destinationId,
        prototype.destinationX,
        prototype.destinationY,
        false
      )

      // Cria a aresta
      lastEdge = new Edge(prototype.id, source, destination, {
        realDistance: prototype.length,
        realSpeed: prototype.speed,
      })

      // Ao final, leva a camera ate o resultado
      Camera.center(lastEdge.source)
    }
  }
}
