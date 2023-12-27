import { Container, utils, Sprite, Text } from "pixi.js"
import { state } from "../state"
import { updateUserBetAmount } from "../server"
import { fontStyles } from "../variables"
import { Grid } from "./grid"

//game panel
export class GamePanel extends Container {
  container: Container
  grid: Grid
  playButtonSprite: Sprite
  betUpButton: Sprite
  betDownButton: Sprite
  creditText: Text
  betAmountText: Text
  winAmountText: Text
  constructor() {
    super()
    this.grid = state.slotMachine.grid
    this.container = new Container()
    this.addChild(this.container)

    //spin button
    this.playButtonSprite = new Sprite(utils.TextureCache["spin_button"])
    this.playButtonSprite.eventMode = "static"
    this.playButtonSprite.on("pointerdown", () => {
      state.slotMachine.play()
    })
    this.playButtonSprite.scale.set(0.6)
    this.playButtonSprite.x = 432
    this.playButtonSprite.y = 60

    //increase bet
    this.betUpButton = new Sprite(utils.TextureCache["plus_button"])
    this.betUpButton.eventMode = "static"
    this.betUpButton.on("pointerdown", () => {
      updateUserBetAmount(state.user.bet_amt + 1)
      this.updateBetText(state.user.bet_amt)
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
        updateUserBetAmount(state.user.bet_amt - 1)
        this.updateBetText(state.user.bet_amt)
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
      this.playButtonSprite,
      this.betUpButton,
      this.betDownButton,
      this.betAmountText,
      this.creditText,
      this.betAmountText,
      this.winAmountText,
    ]

    this.container.addChild(...conts)
  }

  //ispis kredita
  updateCreditText(amount: number) {
    this.creditText.text = `Credit: ${amount} $`
  }

  //ispis iznosa trenutne opklade
  updateBetText(amount: number) {
    this.betAmountText.text = `Bet: ${amount} $`
  }

  //ispis iznosa trenutne opklade
  updateWinAmountText(amount: number) {
    this.winAmountText.text = `Win: ${amount} $`
  }

  updateLayout(width: number, height: number) {
    this.container.width = this.grid.width
    this.container.scale.y = this.container.scale.x

    this.container.x = this.grid.x
    this.container.y = this.grid.y + this.grid.height
  }
}
