import { Container, utils, Sprite, Text } from "pixi.js"
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
  clickButtonSound: Howl
  constructor() {
    super()
    this.container = new Container()
    this.addChild(this.container)

    //spin button
    this.playButton = new Sprite(utils.TextureCache["spin_button"])
    this.playButton.eventMode = "static"
    this.playButton.on("pointerdown", () => {
      this.clickButtonSound.play()
      components.slotMachine.play()
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
      if (state.user.bet_amt > 1) {
        this.clickButtonSound.play()
        updateUserBetAmount(state.user.bet_amt - 1)
      }
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

    //add to container
    let conts = [
      this.playButton,
      this.betUpButton,
      this.betDownButton,
      this.betAmountText,
      this.creditText,
      this.betAmountText,
      this.winAmountText,
    ]

    this.container.addChild(...conts)

    //sound
    this.clickButtonSound = new Howl({
      src: [soundSource.clickButton],
      volume: 0.5,
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
        if(newPl === true){
          this.betUpButton.eventMode = 'none'
          this.betDownButton.eventMode = 'none'
          this.playButton.eventMode = 'none'
        } else {
          this.betUpButton.eventMode = 'static'
          this.betDownButton.eventMode = 'static'
          this.playButton.eventMode = 'static'
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
