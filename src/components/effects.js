import { Container, Text, TextStyle, Point } from "pixi.js"
import { state } from "../state.js"
import { SmartContainer } from "./smartContainer.js"
import { fontStyles } from "../variables.js"

export class Effects extends Container {
  constructor() {
    super()
    this.name = "Effects"
    this.grid = state.slotMachine.grid
    this.winBoard = state.slotMachine.winBoard
  }

  init() {
    this.container = new Container()
    this.addChild(this.container)
  }

  async multiFlyToWinBoard(round, winRunningTotal) {
    const winList = this.grid.getWinSymbols(round)
    for (let i = 0; i < winList.length; i++) {
      let promises = []
      for (const winline of winList[i].data) {
        this.flyingMultiContainer = new SmartContainer()
        this.flyingMultiContainer.name = "flying_multi"
        this.flyingMultiContainer.scale.set(1.69 * this.grid.scale.x)
        this.container.addChild(this.flyingMultiContainer)
        //2 text object to simulate outline font
        const t = new Text(winline.win, fontStyles.effectsFlyingMulti)
        t.anchor.set(0.5)
        const to = new Text(winline.win, fontStyles.effectsFlyingMultiOutline)
        to.anchor.set(0.5)
        //add to container
        this.flyingMultiContainer.addChild(to)
        this.flyingMultiContainer.addChild(t)
        //get start position
        const symbolPosition = winline.symbol.getGlobalCenter()
        this.flyingMultiContainer.position.set(
          symbolPosition.x,
          symbolPosition.y
        )

        //get actual target position
        const target = this.getWinboardTargetPosition()
        await this.flyingMultiContainer.moveTo(
          target.x,
          target.y,
          10 / (0.589 / this.grid.scale.x)
        )
        winRunningTotal.value += winline.win
        this.winBoard.updateText(winRunningTotal.value)
        this.flyingMultiContainer.destroy()
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, 15 + Math.random() * 15)
        })
      }

      //pause between multiple wins if not last win
      if (i < winList.length - 1) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, 75 + Math.random() * 75)
        })
      }

      await Promise.all(promises)
      this.flyingMultiContainer = null
      const children = this.container.removeChildren()
      for (const child of children) {
        child.destroy()
      }
    }
  }

  //get actual winboard position
  getWinboardTargetPosition() {
    return this.winBoard.multiText.getGlobalPosition()
  }

  //update target when resizing screen
  updateFlyingMultiTargetPosition() {
    if (this.flyingMultiContainer) {
      this.flyingMultiContainer.updateMove(this.getWinboardTargetPosition())
    }
  }

  //update text size
  updateTextSize() {
    const fm = this.container.getChildByName("flying_multi")
    if (fm) {
      fm.scale.set(1.69 * this.grid.scale.x)
    }
  }

  updateLayout(width, height) {
    this.updateTextSize()
    this.updateFlyingMultiTargetPosition()
  }
}
