import { Sprite, utils, Container, Text } from "pixi.js"
import { components, state } from "../state"
import { fontStyles } from "../settings"
import { reaction } from "mobx"

export class WinBoard extends Container {
  name: string
  container: Container
  winBoardSprite: Sprite
  multiLabelText: Text
  multiText: Text

  constructor() {
    super()
    this.name = "Winboard"
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

    reaction(
      () => state.winRunningTotal,
      (newWRT) => {
        this.multiText.text = `${newWRT}x`
      }
    )
  }

  updateLayout(width: number, height: number) {
    if (width / height >= 1) {
      this.winBoardSprite.texture = utils.TextureCache["woodboard_prt"]
      //landscape
      this.width = components.grid.width / 4
      this.scale.y = this.scale.x

      this.x = components.grid.x - this.width / 2 - 10
      this.y = components.grid.y + this.height / 2
    } else {
      //portrait
      this.winBoardSprite.texture = utils.TextureCache["woodboard_lnd"]

      this.width = components.grid.width / 2
      this.scale.y = this.scale.x

      this.x = components.grid.x + components.grid.width / 2
      this.y = components.grid.y - this.height / 2 - 5
    }
  }
}
