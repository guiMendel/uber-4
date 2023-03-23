// Provides a variety of useful random related operators
export default class Random {
  static get() {
    return Math.random()
  }

  // Toss a coin with probability in range [0,1]
  static coinToss(probability = 0.5) {
    return Random.get() <= probability
  }

  // Returns an int in range [start, end[
  static rangeInt(start, end) {
    return Math.floor(Math.random() * (end - start)) + start
  }

  // Returns a float in range [start, end[
  static rangeFloat(start, end) {
    return Math.random() * (end - start) + start
  }

  static sample(structure) {
    if (Array.isArray(structure))
      return structure[Random.rangeInt(0, structure.length)]

    return structure[Random.sample(Object.keys(structure))]
  }

  // Extracted from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  static shuffle(array) {
    let currentIndex = array.length
    let randomIndex

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Random.rangeInt(0, currentIndex)
      currentIndex--

      // And swap it with the current element.
      ;[array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ]
    }

    return array
  }
}
