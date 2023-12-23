import { Sprite, utils, Container } from "pixi.js"
import { state } from "../state.js"

export class WinBoard extends Container {
  constructor() {
    super()
    this.name = "Winboard"
    this.grid = state.slotMachine.grid
  }

  init(){

    this.container = new Container()
    this.addChild(this.container)

    //background landscape
    this.winBoardSprite = new Sprite(utils.TextureCache["woodboard_lnd"])
    this.winBoardSprite.anchor.set(0.5)
    this.container.addChild(this.winBoardSprite)
  }

  updateLayout(width, height) {
    //this.container.scale.set(0.5)
    if (width / height >= 1) {
      this.winBoardSprite.texture = utils.TextureCache["woodboard_prt"]
      //landscape
      this.container.width = (this.grid.width)/4
      this.container.scale.y = this.container.scale.x

        this.container.x =this.grid.x - this.container.width/2 -10
        this.container.y = this.grid.y + this.container.height/2

    } else {
      //portrait
      this.winBoardSprite.texture = utils.TextureCache["woodboard_lnd"]

      this.container.width = this.grid.width/2
      this.container.scale.y = this.container.scale.x

      this.container.x = this.grid.x + this.grid.width/2
      this.container.y = this.grid.y - this.container.height/2 -5
    }

    //this.width = width
    //this.height = height

    // this.x = 0
    // this.y = 0

  }

}
