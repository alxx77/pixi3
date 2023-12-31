import { Container, Text } from "pixi.js"
import { state, components } from "../state"
import { SmartContainer } from "./smartContainer"
import { fontStyles } from "../variables"
import { reaction } from "mobx"
import Timeout, { TimeoutInstance } from "smart-timeout"

export class Effects extends Container {
  container: Container
  private flyingMultiContainerList: SmartContainer[]
  private timeoutList: TimeoutInstance[]
  private flyingMultiContainerFinishPromises: Promise<void>[]
  constructor() {
    super()
    this.name = "Effects"
    this.container = new Container()
    this.addChild(this.container)

    this.timeoutList = []
    this.flyingMultiContainerList = []
    this.flyingMultiContainerFinishPromises = []

    //when skip feature request is made
    //tell all existing multis to go to final destination
    //also reset timeouts to 0ms
    reaction(
      () => state.skipFeature,
      (newVal, oldVal) => {
        if (newVal === true && oldVal === false) {
          this.flyingMultiContainerList.forEach((el) => {
            el.goToFinalPosition()
          })
          for (const timeout of this.timeoutList) {
            timeout.reset(0)
          }
        }
      }
    )
  }

  //flying multiplier effect
  async multiFlyToWinBoard() {
    const winSymbolList = state.winSymbolsPerRound
    //loop through winning symbols
    for (let i = 0; i < winSymbolList.length; i++) {
      this.timeoutList = []
      this.flyingMultiContainerList = []
      this.flyingMultiContainerFinishPromises = []
      //for each win group
      for (const winSymbolEntry of winSymbolList[i].data) {
        //new container for multiplier
        const flyingMultiContainer = new SmartContainer()
        this.flyingMultiContainerList.push(flyingMultiContainer)
        flyingMultiContainer.name = "flying_multi"
        flyingMultiContainer.scale.set(1.69 * components.grid.scale.x)
        this.container.addChild(flyingMultiContainer)

        //2 text object to simulate outline font
        const t = new Text(winSymbolEntry.win, fontStyles.effectsFlyingMulti)
        t.anchor.set(0.5)
        const to = new Text(
          winSymbolEntry.win,
          fontStyles.effectsFlyingMultiOutline
        )
        to.anchor.set(0.5)
        //add to container
        flyingMultiContainer.addChild(to)
        flyingMultiContainer.addChild(t)

        //get&set start position
        const symbolPosition = winSymbolEntry.symbol.getGlobalCenter()
        flyingMultiContainer.position.set(symbolPosition.x, symbolPosition.y)

        //get actual target position
        const target = this.getWinboardTargetPosition()

        //perform move
        const p = flyingMultiContainer.moveTo(
          target.x,
          target.y,
          10 / (0.589 / components.grid.scale.x),
          () => {
            //update values in state
            state.setWinRunningTotal(state.winRunningTotal + winSymbolEntry.win)
          }
        )

        //since we are not waiting them immediately we need
        //to save promises so we can later check when they are settled
        this.flyingMultiContainerFinishPromises.push(p)

        if (state.skipFeature === false) {
          //make a little pause if there is no skip feature request
          await new Promise<void>((resolve) => {
            const t = Timeout.instantiate(() => {
              resolve()
            }, 100 + Math.random() * 50)
            this.timeoutList.push(t)
          })
        } else {
          //if there IS skipFeature request
          //set final position on created container immediately
          flyingMultiContainer.goToFinalPosition()
        }
      }

      //pause between multiple wins if not last win
      if (i < winSymbolList.length - 1) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 75 + Math.random() * 75)
        })
      }

      //wait for all multis to finish fly
      await Promise.all(this.flyingMultiContainerFinishPromises)

      this.timeoutList = []
      this.flyingMultiContainerList = []
      this.flyingMultiContainerFinishPromises = []

      //clear
      const children = this.container.removeChildren()
      for (const child of children) {
        child.destroy()
      }

      console.log("effects finished")
    }
  }

  //get actual winboard position
  getWinboardTargetPosition() {
    return components.winBoard.multiText.getGlobalPosition()
  }

  //update target dynamically when resizing screen
  updateFlyingMultiTargetPosition() {
    const point = this.getWinboardTargetPosition()
    for (const multi of this.flyingMultiContainerList) {
      multi.updateMove(point)
    }
  }

  //update text size
  updateTextSize() {
    const fm = this.container.getChildByName("flying_multi")
    if (fm) {
      fm.scale.set(1.69 * components.grid.scale.x)
    }
  }

  updateLayout(width: number, height: number) {
    this.updateTextSize()
    this.updateFlyingMultiTargetPosition()
  }
}
