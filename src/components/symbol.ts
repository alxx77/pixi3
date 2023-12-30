import { Sprite, utils, ColorMatrixFilter, Point } from "pixi.js"
import { SmartContainer } from "./smartContainer"
import { state } from "../state"

//symbol class
export class Symbol extends SmartContainer {
  public sprite: Sprite
  private brightnessFilter: ColorMatrixFilter
  constructor(name: string) {
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
    this.brightnessFilter.brightness(1.5, false)
    if (!this.sprite.filters) {
      this.sprite.filters = [this.brightnessFilter]
    }
  }

  showLowSprite() {
    this.brightnessFilter.brightness(0.8, false)
    if (!this.sprite.filters) {
      this.sprite.filters = [this.brightnessFilter]
    }
  }

  async flicker(cycles: number, timeMs: number) {
    for (let i = 0; i < cycles; i++) {
      this.showHiSprite()
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, timeMs)
      })
      await new Promise<void>((resolve) => {
        this.showLowSprite()
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

  async flicker1(cycles: number, timeMs: number) {
    const self = this
    const g = this.flickerG(self, cycles, timeMs)

     return new Promise<void>(async (resolve) => {
      while (true) {
        let next = g.next(state.skipFeature)
        if (next.done === false) {
          await next.value
        } else {
          break
        }
      }
      resolve()
    })
  }

  //generate sequence of promises
  flickerG = function* (
    self: Symbol,
    cycles: number,
    timeMs: number
  ): Generator<Promise<void>, void, boolean> {
    let earlyExit = false
    const fns = [
      self.showHiSprite.bind(self),
      self.showLowSprite.bind(self),
      self.showDefaultSprite.bind(self),
    ]
    for (let i = 0; i < cycles; i++) {
      for (const fn of fns) {
        earlyExit = yield new Promise<void>((resolve) => {
          fn()
          setTimeout(() => {
            resolve()
          }, timeMs)
        })
        //return default brightness
        if (earlyExit === true) {
          yield new Promise<void>((resolve) => {
            fns[2]()
            setTimeout(() => {
              resolve()
            }, timeMs)
          })
          return
        }
      }
    }
  }

  getGlobalCenter() {
    const p = new Point(this.width / 2, this.height / 2)
    return this.toGlobal(p)
  }
}
