import { Sprite, utils, Text, Container } from "pixi.js"
import { components, state } from "../state"
import * as TWEEN from "@tweenjs/tween.js"
import { fontStyles, soundSource } from "../variables"
import { Howl } from "howler"

export class Winfeedback extends Container {
  name: string
  container: Container
  backgroundSprite: Sprite
  winText: Text
  clickButtonSound: Howl
  showSound: Howl
  constructor() {
    super()
    this.name = "win feedback"

    this.container = new Container()
    this.addChild(this.container)

    //background
    this.backgroundSprite = new Sprite(utils.TextureCache["woodboard_lnd"])
    this.backgroundSprite.anchor.set(0.5)
    this.container.addChild(this.backgroundSprite)

    //credit
    this.winText = new Text(`You won 0$`, fontStyles.winFeedbackText)
    this.winText.anchor.set(0.5)
    this.container.addChild(this.winText)
    this.eventMode = "static"
    this.on("pointerdown", () => {
      //this.clickButtonSound.play()
      this.hide()
    })

    //hide container
    this.container.scale.set(0)

    //sound
    this.clickButtonSound = new Howl({
      src: [soundSource.clickButton],
      volume: 0.5,
      loop: false,
    })

    this.showSound = new Howl({
      src: [soundSource.accent],
      volume: 0.1,
      loop: false,
    })
  }

  hide() {
    const self = this

    new TWEEN.Tween({ width: components.grid.width * 0.5 })
      .to({ width: [components.grid.width, 0] }, 350)
      .easing(TWEEN.Easing.Exponential.InOut)
      .interpolation(TWEEN.Interpolation.CatmullRom)
      .onUpdate(function (value: any) {
        self.container.width = value.width
        self.container.scale.y = self.container.scale.x
      })
      .onComplete(() => {
        state.setWinFeedbackVisible(false)
      })
      .start()
  }

  showWin(win_amount: number) {
    const self = this

    this.winText.text = `You won ${win_amount}$!`

    state.setWinFeedbackVisible(true)

    new TWEEN.Tween({ width: 0 })
      .to({ width: [components.grid.width, components.grid.width * 0.5] }, 350)
      .easing(TWEEN.Easing.Exponential.In)
      .interpolation(TWEEN.Interpolation.CatmullRom)
      .onUpdate(function (value: any) {
        self.container.width = value.width
        self.container.scale.y = self.container.scale.x
      })
      .onComplete(() => {
        this.showSound.play()
      })
      .start()
  }

  updateLayout(width: number, height: number) {
    if (this.container.scale.x > 0) {
      this.container.width = components.grid.width * 0.5
      this.container.scale.y = this.container.scale.x
    }

    this.container.x = components.grid.x + components.grid.width / 2
    this.container.y = components.grid.y + components.grid.height / 4
  }
}
