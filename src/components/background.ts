import { Container, Sprite, utils } from "pixi.js"

export class Background extends Container {
  private container: Container
  private backgroundSprite: Sprite
  constructor() {
    super()
    //container
    this.container = new Container()
    this.name = "background"
    this.addChild(this.container)

    //sprite
    this.backgroundSprite = new Sprite(utils.TextureCache["main_background"])
    this.container.addChild(this.backgroundSprite)
  }

  updateLayout(width: number, height: number) {
    this.backgroundSprite.x = -this.backgroundSprite.width / 2 + width / 2
    this.backgroundSprite.y = -this.backgroundSprite.height / 2 + height / 2
  }
}
