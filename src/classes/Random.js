// Provides a variety of useful random related operators
export default class Random {
  static get() {
    return Math.random()
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
}
