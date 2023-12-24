import { Container, Text, TextStyle, Point } from "pixi.js"
import { state } from "../state.js"
import { SmartContainer } from "./smartContainer.js"

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

    this.multiTextStyle = new TextStyle({
      fontFamily: "Troika ",
      fontSize: "64px",
      fill: "yellow",
    })
  }

  async multiFlyToWinBoard(round,winRunningTotal) {
    const winList = this.grid.getWinSymbols(round)
    for (let i = 0; i < winList.length; i++) {
      let promises = []
      for (const winline of winList[i].data) {
        const sc = new SmartContainer()
        this.container.addChild(sc)
        const t = new Text(winline.win, this.multiTextStyle)
        t.anchor.set(0.5)
        const symbolPosition = winline.symbol.getGlobalCenter()
        sc.position.set(symbolPosition.x, symbolPosition.y)
        sc.addChild(t)
        let target = this.winBoard.multiText.getGlobalPosition()
        await sc.moveTo(target.x, target.y, 10)
        winRunningTotal.value += winline.win
        this.winBoard.updateText(winRunningTotal.value)
        sc.destroy()
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
      const children = this.container.removeChildren()
      for (const child of children) {
        child.destroy()
      }
    }
  }

  updateLayout(width, height) {
    this.width = width
    this.height = height
  }
}
