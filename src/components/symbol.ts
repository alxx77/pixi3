import { Sprite, utils, ColorMatrixFilter, Point } from "pixi.js"
import { SmartContainer } from "./smartContainer"

//symbol class
export class Symbol extends SmartContainer {
  public sprite: Sprite
  private brightnessFilter:ColorMatrixFilter
  constructor(name:string) {
    super()
    this.name = name
    this.sprite = new Sprite(utils.TextureCache[name])
    this.addChild(this.sprite)
    this.brightnessFilter = new ColorMatrixFilter()
  }

  showDefaultSprite() {
    this.sprite.filters = null
  }

  showHiSprite() {
    this.brightnessFilter.brightness(1.5,false)
    if(!this.sprite.filters){
      this.sprite.filters = [this.brightnessFilter]
    }
  }

  showLowSprite() {
    this.brightnessFilter.brightness(0.1,false)
    if(!this.sprite.filters){
      this.sprite.filters = [this.brightnessFilter]
    }
  }

  async flicker(cycles:number, timeMs:number) {
    for (let i = 0; i < cycles; i++) {
      this.showHiSprite()
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, timeMs)
      })
      await new Promise<void>((resolve) => {
        this.showLowSprite
        setTimeout(() => {
          resolve()
        }, timeMs)
      })
      await new Promise<void>((resolve) => {
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
