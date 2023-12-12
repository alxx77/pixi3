import { Sprite, utils } from "pixi.js"

import { SmartContainer } from "./smartContainer.js"

export class Symbol extends SmartContainer {
  constructor(name, parentContainer) {
    super()
    this.name = name
    if (parentContainer) {
      parentContainer.addChild(this)
    }
    this.sprite = null
    this.setSprites(new Sprite(utils.TextureCache[name]))
    // this.spine = new Spine()
    // this.addChild(this.spine)
  }

  setSprites(sprite) {
    this.sprite = sprite
    this.addChild(sprite)
  }

}
