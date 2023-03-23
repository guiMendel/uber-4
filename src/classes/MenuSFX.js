import hover from '../assets/sounds/soft.mp3'
import click from '../assets/sounds/click.mp3'
import projectorButton from '../assets/sounds/projectorButton.mp3'

export default class MenuSFX {
  static className = "MenuSFX"

  static #instance = null

  static getInstance() {
    if (this.#instance == null) this.#instance = new MenuSFX()

    return this.#instance
  }

  onHover = new Audio(hover)

  static playHover() {
    const instance = this.getInstance()

    instance.onHover.pause()
    instance.onHover.currentTime = 0

    instance.onHover.play().catch(() => {})
  }

  onClick = new Audio(click)

  static playClick() {
    const instance = this.getInstance()

    instance.onClick.pause()
    instance.onClick.currentTime = 0

    instance.onClick.play().catch(() => {})
  }

  onProjectorButton = new Audio(projectorButton)

  static playProjectorButton() {
    const instance = this.getInstance()

    instance.onProjectorButton.pause()
    instance.onProjectorButton.currentTime = 0

    instance.onProjectorButton.play().catch(() => {})
  }
}
