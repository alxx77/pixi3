import { Container } from "pixi.js"
import { components} from "../state"

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
      components.grid.updateLayout(width, height)
      components.background.updateLayout(width, height)
      components.gamePanel.updateLayout(width, height)
      components.winFeedback.updateLayout(width, height)
      components.winBoard.updateLayout(width, height)
      components.effects.updateLayout(width, height)

  }
}
