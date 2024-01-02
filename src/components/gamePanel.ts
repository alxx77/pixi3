import { Container, utils, Sprite, Text, ColorMatrixFilter } from "pixi.js"
import { components, state } from "../state"
import { updateUserBetAmount } from "../server"
import { fontStyles, soundSource } from "../variables"
import { Howl } from "howler"
import { reaction } from "mobx"

//game panel
export class GamePanel extends Container {
  container: Container
  playButton: Sprite
  betUpButton: Sprite
  betDownButton: Sprite
  creditText: Text
  betAmountText: Text
  winAmountText: Text
  skipFeatureText: Text
  clickButtonSound: Howl
  private brightnessFilter: ColorMatrixFilter
  constructor() {
    super()
    this.container = new Container()
    this.addChild(this.container)

    //spin button
    this.playButton = new Sprite(utils.TextureCache["spin_button"])
    this.playButton.eventMode = "static"
    this.playButton.on("pointerdown", () => {
      this.clickButtonSound.play()
      state.setPlayRoundRequest(true)
    })
    this.playButton.scale.set(0.6)
    this.playButton.x = 432
    this.playButton.y = 60

    //increase bet
    this.betUpButton = new Sprite(utils.TextureCache["plus_button"])
    this.betUpButton.eventMode = "static"
    this.betUpButton.on("pointerdown", () => {
      this.clickButtonSound.play()
      updateUserBetAmount(state.user.bet_amt + 1)
    })
    this.betUpButton.scale.set(0.25)
    this.betUpButton.x = 915
    this.betUpButton.y = 146

    //decrease bet
    this.betDownButton = new Sprite(utils.TextureCache["minus_button"])
    this.betDownButton.scale.set(0.25)
    this.betDownButton.x = 1085
    this.betDownButton.y = 146
    this.betDownButton.eventMode = "static"
    this.betDownButton.on("pointerdown", () => {
      this.clickButtonSound.play()
      updateUserBetAmount(state.user.bet_amt - 1)
    })

    //credit
    this.creditText = new Text(`Credit: 0 $`, fontStyles.gamePanelCredit)
    this.creditText.x = 10
    this.creditText.y = 160

    //bet
    this.betAmountText = new Text(`Bet: 0 $`, fontStyles.gamePanelBet)
    this.betAmountText.x = 1002
    this.betAmountText.y = 70

    //win
    this.winAmountText = new Text(`Win: 0 $`, fontStyles.gamePanelWin)
    this.winAmountText.x = 10
    this.winAmountText.y = 70

    //skip feature text
    this.skipFeatureText = new Text(
      `Press Space to Skip`,
      fontStyles.skipFeatureText
    )
    this.skipFeatureText.x = 1225 / 2
    this.skipFeatureText.y = 270
    this.skipFeatureText.anchor.set(0.5, 0)

    //add to container
    let controls = [
      this.playButton,
      this.betUpButton,
      this.betDownButton,
      this.betAmountText,
      this.creditText,
      this.betAmountText,
      this.winAmountText,
      this.skipFeatureText,
    ]

    this.container.addChild(...controls)

    //sound
    this.clickButtonSound = new Howl({
      src: [soundSource.clickButton],
      volume: 0.4,
      loop: false,
    })

    //setup reactive updates of text
    reaction(
      () => state.user.bet_amt,
      (newBet) => {
        this.betAmountText.text = `Bet: ${newBet} $`
      }
    )
    reaction(
      () => state.user.credit_amt,
      (newCr) => {
        this.creditText.text = `Credit: ${newCr} $`
      }
    )

    reaction(
      () => state.winAmount,
      (newWinAmount) => {
        this.winAmountText.text = `Win: ${newWinAmount} $`
      }
    )

    reaction(
      () => state.isPlayingRound,
      (newPl) => {
        if (newPl === true) {
          this.betUpButton.eventMode = "none"
          this.betDownButton.eventMode = "none"
          this.playButton.eventMode = "none"
        } else {
          this.betUpButton.eventMode = "static"
          this.betDownButton.eventMode = "static"
          this.playButton.eventMode = "static"
        }
      }
    )

    this.brightnessFilter = new ColorMatrixFilter()
    this.brightnessFilter.brightness(1.4, false)
    
    reaction(
      () => state.isSpaceBarKeyDown,
      (newVal,oldVal) => {
        if (newVal === true && oldVal === false) {
          this.playButton.filters = [this.brightnessFilter]
        } else {
          this.playButton.filters = []
        }
      }
    )
  }

  updateLayout(width: number, height: number) {
    this.container.width = components.grid.width
    this.container.scale.y = this.container.scale.x

    this.container.x = components.grid.x
    this.container.y = components.grid.y + components.grid.height
  }
}
