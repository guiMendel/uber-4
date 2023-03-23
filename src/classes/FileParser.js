import Configuration from '../configuration/Configuration'
import Camera from './Camera'
import Car from './Drawables/Car'
import Client from './Drawables/Client'
import Edge from './Drawables/Edge'
import Vertex from './Drawables/Vertex'
import Map from './Map'

// Este arquivo interpreta o conteudo de um arquivo e adiciona as entidades correspondentes
export default class FileParser {
  static className = "FileParser"

  static #internalParse(
    fileData,
    headerTransaltor,
    prototypeInstantiator,
    fixHeaderPiece = (piece) => piece
  ) {
    // Descobre os campos necessarios
    const requiredFields = new Set(Object.values(headerTransaltor))

    // Separa as linhas e o header
    const [header, ...lines] = fileData.split('\n')

    // Guarda a ordem em que as propriedades serao definidas
    const propertyOrder = []

    // Le o cabecalho para entender qual a ordem dos dados
    for (let headerPiece of header.split(/\s/)) {
      if (!headerPiece) continue

      headerPiece = fixHeaderPiece(headerPiece)

      const property = headerTransaltor[headerPiece.toLowerCase()]

      if (property == undefined) {
        Map.announceError('Cabeçalho inválido de arquivo')
        return
      }

      propertyOrder.push(property)
    }

    // Verifica que tem a quantidade necessaria de colunas
    if ([...requiredFields].length != propertyOrder.length) {
      Map.announceError('Quantidade incorreta de colunas')
      return
    }

    // Vai guardar os prototipos de aresta a serem gerados
    const prototypes = []

    // Para cada linha
    for (const line of lines) {
      // Pega os numeros isolados
      const numbers = line.split(/\s/)

      // Descarta o \n
      if (numbers[numbers.length - 1] == '') numbers.pop()

      if (numbers.length != propertyOrder.length) {
        Map.announceError(
          'Uma (ou mais) das linhas do arquivo não possui a quantidade correta de colunas'
        )
        return
      }

      // Cria o prototipo
      const prototype = {}

      // Passa por cada propriedade
      for (const [index, property] of Object.entries(propertyOrder)) {
        // Adiciona a propriedade
        prototype[property] = numbers[index]
      }

      prototypes.push(prototype)
    }

    // Para cada prototipo
    for (const prototype of prototypes) {
      try {
        prototypeInstantiator(prototype)
      } catch (error) {
        console.log(error.error)
        Map.announceError(error.message)
      }
    }
  }

  static parseStreets(fileData) {
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

    const fixHeaderPiece = (piece) => {
      // Pega anomalias com acentos
      if (/dist.ncia_km/i.test(piece)) return 'dist.ncia_km'
      return piece
    }

    // Define como instanciar a aresta dado o seu prototipo
    const prototypeInstantiator = (prototype) => {
      // Cria os vertices
      let source

      try {
        source = Vertex.createOrGet(
          prototype.sourceId,
          prototype.sourceX,
          prototype.sourceY,
          false
        )
      } catch (error) {
        // Se falhar, pega o vertice com esse id
        Map.announceError(error)
        source = Vertex.instances[prototype.sourceId]
      }

      let destination
      try {
        destination = Vertex.createOrGet(
          prototype.destinationId,
          prototype.destinationX,
          prototype.destinationY,
          false
        )
      } catch (error) {
        // Se falhar, pega o vertice com esse id
        Map.announceError(error)
        destination = Vertex.instances[prototype.destinationId]
      }

      // Cria a aresta
      let edge
      try {
        edge = Edge.createOrGet(prototype.id, source, destination, {
          realDistance: prototype.length,
          realSpeed: prototype.speed,
        })
      } catch (error) {
        // Se falhar, cria com qualquer id
        Map.announceError(error)
        edge = new Edge(undefined, source, destination, {
          realDistance: prototype.length,
          realSpeed: prototype.speed,
        })
      }

      // Ao final, leva a camera ate o resultado
      Camera.center(edge.source)
    }

    FileParser.#internalParse(
      fileData,
      headerTransaltor,
      prototypeInstantiator,
      fixHeaderPiece
    )
  }

  static parseClients(fileData) {
    // Define qual nome no cabcealho corresponde a cada propriedade da aresta
    const headerTransaltor = {
      cliente_id: 'id',
      loc_cliente_x: 'x',
      loc_cliente_y: 'y',
      dest_cliente_x: 'destinationX',
      dest_cliente_y: 'destinationY',
    }

    // Define como instanciar a aresta dado o seu prototipo
    const prototypeInstantiator = (prototype) => {
      const { pixelsPerKilometer } = Configuration.getInstance().general

      // Cria cliente
      let client

      try {
        client = Client.createOrGet(
          prototype.id,
          {
            x: prototype.x * pixelsPerKilometer,
            y: prototype.y * pixelsPerKilometer,
          },
          {
            x: prototype.destinationX * pixelsPerKilometer,
            y: prototype.destinationY * pixelsPerKilometer,
          }
        )
      } catch (error) {
        Map.announceError(error)
        client = new Client(
          undefined,
          {
            x: prototype.x * pixelsPerKilometer,
            y: prototype.y * pixelsPerKilometer,
          },
          {
            x: prototype.destinationX * pixelsPerKilometer,
            y: prototype.destinationY * pixelsPerKilometer,
          }
        )
      }

      // Ao final, leva a camera ate o resultado
      Camera.center(client)
    }

    FileParser.#internalParse(fileData, headerTransaltor, prototypeInstantiator)
  }

  static parseCars(fileData) {
    // Define qual nome no cabcealho corresponde a cada propriedade
    const headerTransaltor = {
      carro_id: 'id',
      loc_carro_x: 'x',
      loc_carro_y: 'y',
      aresta_id: 'edgeId',
    }

    const prototypeInstantiator = (prototype) => {
      const { pixelsPerKilometer } = Configuration.getInstance().general

      // Recupera a aresta
      const edge = Edge.instances[prototype.edgeId]

      // Verifica se aresta existe
      if (edge == undefined) {
        Map.announceError(`Aresta de id ${prototype.edgeId} não existe`)
        return
      }

      let car

      try {
        car = Car.createOrGet(
          prototype.id,
          edge,
          prototype.x * pixelsPerKilometer,
          prototype.y * pixelsPerKilometer
        )
      } catch (error) {
        Map.announceError(error)
        car = new Car(
          undefined,
          edge,
          prototype.x * pixelsPerKilometer,
          prototype.y * pixelsPerKilometer
        )
      }

      // Ao final, leva a camera ate o resultado
      Camera.center(car)
    }

    FileParser.#internalParse(fileData, headerTransaltor, prototypeInstantiator)
  }
}
