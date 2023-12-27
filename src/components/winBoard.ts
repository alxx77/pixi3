import { Sprite, utils, Container, Text, } from "pixi.js"
import { state } from "../state"
import { fontStyles } from "../variables"
import { Grid } from "./grid"

export class WinBoard extends Container {
  name:string
  grid: Grid
  container: Container
  winBoardSprite: Sprite
  multiLabelText: Text
  multiText: Text

  constructor() {
    super()
    this.name = "Winboard"
    this.grid = state.slotMachine.grid
    this.container = new Container()
    this.addChild(this.container)

    //background landscape
    this.winBoardSprite = new Sprite(utils.TextureCache["woodboard_lnd"])
    this.winBoardSprite.anchor.set(0.5)
    this.container.addChild(this.winBoardSprite)

    //multiplier
    this.multiLabelText = new Text(`Multiplier`, fontStyles.winBoardLabel)
    this.multiLabelText.anchor.set(0.5)
    this.multiLabelText.y = -80

    this.multiText = new Text(`0x`, fontStyles.winBoardMulti)
    this.multiText.anchor.set(0.5)
    this.multiText.y = 27

    this.container.addChild(this.multiLabelText)
    this.container.addChild(this.multiText)
  }

  updateText(amount:number){
    this.multiText.text = `${amount}x`
  }

  resetBoard(){
    this.updateText(0)
  }

  updateLayout(width:number, height:number) {
    //this.container.scale.set(0.5)
    if (width / height >= 1) {
      this.winBoardSprite.texture = utils.TextureCache["woodboard_prt"]
      //landscape
      this.container.width = this.grid.width / 4
      this.container.scale.y = this.container.scale.x

      this.container.x = this.grid.x - this.container.width / 2 - 10
      this.container.y = this.grid.y + this.container.height / 2
    } else {
      //portrait
      this.winBoardSprite.texture = utils.TextureCache["woodboard_lnd"]

      this.container.width = this.grid.width / 2
      this.container.scale.y = this.container.scale.x

      this.container.x = this.grid.x + this.grid.width / 2
      this.container.y = this.grid.y - this.container.height / 2 - 5
    }
  }
}
