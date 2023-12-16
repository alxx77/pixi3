import { Container, utils, Sprite, Texture } from "pixi.js"
import { state } from "../state.js"

export class GamePanel extends Container {
  constructor() {
    super()
    this.playButtonSprite = null
  }

  init() {

    const background = new Sprite (Texture.EMPTY)
    background.name ="panel_backg"
    background.width = state.slotMachine.grid.width
    background.height = background.width*0.2

    this.addChild(background)
    
    //spin button
    this.playButtonSprite = new Sprite(utils.TextureCache["spin_button"])

    this.playButtonSprite.eventMode = "static"
    this.playButtonSprite.on("pointerdown", () => {
      state.slotMachine.play()
    })
    this.addChild(this.playButtonSprite)
    this.playButtonSprite.scale.x = 0.6
    this.playButtonSprite.scale.y = 0.15 * this.width/this.height
    this.playButtonSprite.x = (this.width - this.playButtonSprite.width)/2
    this.playButtonSprite.y = state.slotMachine.grid.height/20
  }

  updateLayout(width, height) {
    this.width = state.slotMachine.grid.width
    this.height = this.width*0.2

    this.x = (width-this.width)/2
    this.y = state.slotMachine.grid.y + state.slotMachine.grid.height

  }
}
