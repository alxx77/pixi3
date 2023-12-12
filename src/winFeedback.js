
import { SmartContainer } from "./smartContainer.js"

export class Winfeedback extends SmartContainer {
  constructor(name, parentContainer) {
    super()
    this.name = name
    if (parentContainer) {
      parentContainer.addChild(this)
    }
  }
}