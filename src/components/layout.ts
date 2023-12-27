import { Container } from "pixi.js"
import { state } from "../state"

//root container
export class Layout extends Container {
  public name: string
  constructor() {
    super()
    this.name = "Layout"
    //set initial layout container size
    this.width = document.documentElement.clientWidth
    this.height = document.documentElement.clientHeight
  }

  updateLayout(width: number, height: number) {
    //first align the grid, then everything else
      state.slotMachine.grid.updateLayout(width, height)
      state.slotMachine.background.updateLayout(width, height)
      state.slotMachine.gamePanel.updateLayout(width, height)
      state.slotMachine.winFeedback.updateLayout(width, height)
      state.slotMachine.winBoard.updateLayout(width, height)
      state.slotMachine.effects.updateLayout(width, height)

  }
}
