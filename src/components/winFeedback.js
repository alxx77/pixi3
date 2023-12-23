import { Sprite, utils, TextStyle, Text, Container } from "pixi.js"
import { SmartContainer } from "./smartContainer.js"
import { state } from "../state.js"
import * as TWEEN from "@tweenjs/tween.js"

export class Winfeedback extends SmartContainer {
  constructor() {
    super()
    this.name = "win feedback"
    this.grid = state.slotMachine.grid
  }

  init() {
    //background
    this.backgroundSprite = new Sprite(utils.TextureCache["woodboard_lnd"])
    this.backgroundSprite.anchor.set(0.5)
    this.addChild(this.backgroundSprite)

    //wintext
    let styleCreditText = new TextStyle({
      fontFamily:
        "Segoe UI,Frutiger,Frutiger Linotype,Dejavu Sans,Helvetica Neue,Arial,sans-serif; ",
      fontSize: "64px",
      fill: "white",
    })

    //credit
    this.winText = new Text(`You won 0$`, styleCreditText)
    this.winText.anchor.set(0.5)

    this.addChild(this.winText)

    this.eventMode = "static"
    this.on("pointerdown", () => {
      this.hide()
    })

    //hide container
    this.scale.set(0)

  }

  hide() {
    const self = this

    new TWEEN.Tween({ width: this.grid.width * 0.5 })
      .to({ width: [this.grid.width, 0] }, 350)
      .easing(TWEEN.Easing.Exponential.InOut)
      .interpolation(TWEEN.Interpolation.CatmullRom)
      .onUpdate(function (value) {
        self.width = value.width
        self.scale.y = self.scale.x
      })
      .onComplete(() => {
        self.observerSubject.notify("closed")
      }).start()
  }

  showWin(win_amount) {

    const self = this

    this.winText.text = `You won ${win_amount}$!`

    new TWEEN.Tween({ width: 0 })
    .to({ width: [this.grid.width, this.grid.width * 0.5] }, 350)
    .easing(TWEEN.Easing.Exponential.In)
    .interpolation(TWEEN.Interpolation.CatmullRom)
    .onUpdate(function (value) {
      self.width = value.width
      self.scale.y = self.scale.x
    }).start()
  }

  updateLayout(width, height) {
    if(this.scale.x > 0){
      this.width = this.grid.width * 0.5
      this.scale.y = this.scale.x
    }

    this.x = this.grid.x + this.grid.width / 2
    this.y = this.grid.y + this.grid.height / 4
  }
}
