import { Container, utils, Sprite, Texture, Text, TextStyle } from "pixi.js"
import { state } from "../state.js"
import { updateBetAmount } from "../server.js"

export class GamePanel extends Container {
  constructor() {
    super()
    this.playButtonSprite = null
    this.grid = state.slotMachine.grid
  }

  init() {
    const background = new Sprite(Texture.EMPTY)
    background.name = "panel_backg"
    background.width = this.grid.width+10
    background.height = background.width * 0.2
    this.addChild(background)

    //spin button
    this.playButtonSprite = new Sprite(utils.TextureCache["spin_button"])
    this.playButtonSprite.name = "play"
    this.playButtonSprite.eventMode = "static"
    this.playButtonSprite.on("pointerdown", () => {
      state.slotMachine.play()
    })
    this.playButtonSprite.scale.set(0.6)
    this.playButtonSprite.x = 432
    this.playButtonSprite.y = 60

    //increase bet
    this.betUpButton = new Sprite(utils.TextureCache["plus_button"])
    this.betUpButton.name = "bet up"
    this.betUpButton.eventMode = "static"
    this.betUpButton.on("pointerdown", () => {
      updateBetAmount(state.user.bet_amt + 1)
      this.updateBetText(state.user.bet_amt)
    })
    this.betUpButton.scale.set(0.25)
    this.betUpButton.x = 915
    this.betUpButton.y = 146

    //decrease bet
    this.betDownButton = new Sprite(utils.TextureCache["minus_button"])
    this.betDownButton.name = "bet down"
    this.betDownButton.scale.set(0.25)
    this.betDownButton.x = 1085
    this.betDownButton.y = 146
    this.betDownButton.eventMode = "static"
    this.betDownButton.on("pointerdown", () => {
      if(state.user.bet_amt>1) {
        updateBetAmount(state.user.bet_amt - 1)
        this.updateBetText(state.user.bet_amt)
      }
    })

    //styles
    let styleCreditText = new TextStyle({
      fontFamily:
        "Segoe UI,Frutiger,Frutiger Linotype,Dejavu Sans,Helvetica Neue,Arial,sans-serif; ",
      fontSize: "64px",
      fill: "white",
    })

    let styleBetText = new TextStyle({
      fontFamily:
        "Segoe UI,Frutiger,Frutiger Linotype,Dejavu Sans,Helvetica Neue,Arial,sans-serif; ",
      fontSize: "38px",
      fontWeight: "bold",
      fill: "white",
    })

    let styleWinAmountText = new TextStyle({
      fontFamily:
        "Segoe UI,Frutiger,Frutiger Linotype,Dejavu Sans,Helvetica Neue,Arial,sans-serif; ",
      fontSize: "60px",
      fill: "white",
    })

    //credit
    this.creditText = new Text(`Credit: 0 $`, styleCreditText)
    this.creditText.x = 10
    this.creditText.y = 140

    //bet
    this.betAmountText = new Text(`Bet: 0 $`, styleBetText)
    this.betAmountText.x = 1002
    this.betAmountText.y = 70

    //win
    this.winAmountText = new Text(`Win: 0 $`, styleWinAmountText)
    this.winAmountText.x = 10
    this.winAmountText.y = 70

    //add to container

    this.addChild(this.playButtonSprite)
    this.addChild(this.betUpButton)
    this.addChild(this.betDownButton)
    this.addChild(this.betAmountText)
    this.addChild(this.creditText)
    this.addChild(this.betAmountText)
    this.addChild(this.winAmountText)
  }

    //ispis kredita
    updateCreditText(amount) {
      this.creditText.text=`Credit: ${amount} $`
    }
  
    //ispis iznosa trenutne opklade
    updateBetText(amount) {
      this.betAmountText.text=`Bet: ${amount} $`
    }
  
    //ispis iznosa trenutne opklade
    updateWinAmountText(amount) {
      this.winAmountText.text=`Win: ${amount} $`
    }


  updateLayout(width, height) {
    this.width = this.grid.width
    this.scale.y = this.scale.x

    this.x = this.grid.x
    this.y = this.grid.y + this.grid.height
  }
}
