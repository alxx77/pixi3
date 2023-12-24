import { Sprite, utils, ColorMatrixFilter, Point } from "pixi.js"

import { SmartContainer } from "./smartContainer.js"

export class Symbol extends SmartContainer {
  constructor(name, parentContainer) {
    super()
    this.name = name
    if (parentContainer) {
      parentContainer.addChild(this)
    }

    this.reel = parentContainer

    this.sprite = new Sprite(utils.TextureCache[name])

    this.addChild(this.sprite)

    this.brightnessFilter = new ColorMatrixFilter()

  }

  showDefaultSprite() {
    this.sprite.filters = null
  }

  showHiSprite() {
    this.brightnessFilter.brightness(1.5)
    if(!this.sprite.filters){
      this.sprite.filters = [this.brightnessFilter]
    }
  }

  showLowSprite() {
    this.brightnessFilter.brightness(0.1)
    if(!this.sprite.filters){
      this.sprite.filters = [this.brightnessFilter]
    }
  }

  async flicker(cycles, timeMs) {
    for (let i = 0; i < cycles; i++) {
      this.showHiSprite()
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, timeMs)
      })
      await new Promise((resolve) => {
        this.showLowSprite
        setTimeout(() => {
          resolve()
        }, timeMs)
      })
      await new Promise((resolve) => {
        this.showDefaultSprite()
        setTimeout(() => {
          resolve()
        }, timeMs)
      })
    }
  }

  getGlobalCenter(){
    const p = new Point(this.width/2,this.height/2)
    return this.toGlobal(p)
  }

}
