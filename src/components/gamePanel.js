import { Container, utils, Sprite } from "pixi.js"
import { state } from "../state.js"

export class GamePanel extends Container {
  constructor() {
    super()
    this.playButtonSprite = null
  }

  init() {
    //spin button
    this.playButtonSprite = new Sprite(utils.TextureCache["spin_button"])

    this.playButtonSprite.eventMode = "static"
    this.playButtonSprite.on("pointerdown", () => {
      state.slotMachine.play()
    })
    this.addChild(this.playButtonSprite)
    this.playButtonSprite.scale.set(0.25)
  }

  updateLayout(width, height) {
    this.width = state.slotMachine.grid.width
    this.height = this.width*0.2
    this.x = (width-this.width)/2
    this.y = state.slotMachine.grid.y + state.slotMachine.grid.height



  }
}
