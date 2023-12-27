import { Container, Text, TextStyle, Point } from "pixi.js"
import { state } from "../state"
import { SmartContainer } from "./smartContainer"
import { fontStyles } from "../variables"
import { Grid } from "./grid"
import { WinBoard } from "./winBoard"
import { Round, WinRunningTotal } from "../server"

export class Effects extends Container {
  grid: Grid
  container: Container
  winBoard: WinBoard
  private flyingMultiContainer:SmartContainer | undefined
  constructor() {
    super()
    this.name = "Effects"
    this.grid = state.slotMachine.grid
    this.winBoard = state.slotMachine.winBoard
    this.container = new Container()
    this.addChild(this.container)
  }

  //fl
  async multiFlyToWinBoard(round:Round, winRunningTotal:WinRunningTotal) {
    const winSymbolList = this.grid.getWinSymbols(round)
    for (let i = 0; i < winSymbolList.length; i++) {
      for (const winSymbolEntry of winSymbolList[i].data) {

        //new container for multiplier
        this.flyingMultiContainer = new SmartContainer()
        this.flyingMultiContainer.name = "flying_multi"
        this.flyingMultiContainer.scale.set(1.69 * this.grid.scale.x)
        this.container.addChild(this.flyingMultiContainer)

        //2 text object to simulate outline font
        const t = new Text(winSymbolEntry.win, fontStyles.effectsFlyingMulti)
        t.anchor.set(0.5)
        const to = new Text(winSymbolEntry.win, fontStyles.effectsFlyingMultiOutline)
        to.anchor.set(0.5)
        //add to container
        this.flyingMultiContainer.addChild(to)
        this.flyingMultiContainer.addChild(t)

        //get&set start position
        const symbolPosition = winSymbolEntry.symbol.getGlobalCenter()
        this.flyingMultiContainer.position.set(
          symbolPosition.x,
          symbolPosition.y
        )

        //get actual target position
        const target = this.getWinboardTargetPosition()

        //perform move
        await this.flyingMultiContainer.moveTo(
          target.x,
          target.y,
          10 / (0.589 / this.grid.scale.x)
        )

        //update values
        winRunningTotal.value += winSymbolEntry.win
        this.winBoard.updateText(winRunningTotal.value)

        //destroy multi container
        this.flyingMultiContainer.destroy()

        //make a little pause
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 15 + Math.random() * 15)
        })
      }

      //pause between multiple wins if not last win
      if (i < winSymbolList.length - 1) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 75 + Math.random() * 75)
        })
      }

      //clear
      this.flyingMultiContainer = undefined
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

  //update target dynamically when resizing screen
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

  updateLayout(width:number, height:number) {
    this.updateTextSize()
    this.updateFlyingMultiTargetPosition()
  }
}
