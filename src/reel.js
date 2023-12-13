import { SmartContainer } from "./smartContainer.js"
import { BlurFilter, Ticker } from "pixi.js"

import { Symbol } from "./symbol.js"
import { REEL_X_OFFSET, SYMBOL_HEIGHT } from "./initAssets.js"
import { state } from "./state.js"

//linear interpolation
const lerp = (x, y, a) => x * (1 - a) + y * a

export class Reel {
  constructor(grid, reelId) {
    this.grid = grid
    this.container = new SmartContainer()
    this.container.name = "reel"
    this.grid.container.addChild(this.container)
    this.symbols = []
    this.reelId = reelId
    this.xOffset = reelId * REEL_X_OFFSET + 10
    this.reelHeight = SYMBOL_HEIGHT * 5

    this.blurFilter = new BlurFilter(1)

    this.init()
  }

  init() {
    //set x offset
    this.container.x = this.xOffset
  }

  //update symbols
  updateSymbols(symbolStripe) {
    const baseHeigth = this.symbols.length
    //for each symbol name on stripe...
    symbolStripe.forEach((symbolName, idx) => {
      //create new symbol
      const newSymbol = new Symbol(symbolName, this.container)
      //get correct y position
      newSymbol.y = (-baseHeigth - idx + 5) * SYMBOL_HEIGHT
      //push into reel symbols
      this.symbols.push(newSymbol)
    })
  }

  async spinReel2(speed) {
    //total number of symbol shifts
    const shiftCount = this.symbols.length - 7

    //total y translation
    // height added for start and soft landing effect 2 * 0.25
    const yMainTarget = SYMBOL_HEIGHT * (shiftCount + 0.5)

    const ySoftMoveUpTarget = SYMBOL_HEIGHT / 4
    const ySoftLandingMoveUpTarget = SYMBOL_HEIGHT / 2
    const ySoftLandingFinalMoveDownTarget = SYMBOL_HEIGHT / 4

    let step = null
    let counter = 0
    let ticker = new Ticker()

    let g = new this.performMove(0, 0, 0, ySoftMoveUpTarget, speed / 2)

    await new Promise((resolve) => {
      ticker.add((delta) => {
        step = g.next(delta)
        if (step.done === false) {
          this.symbols.forEach((symbol) => {
            //move each symbol
            symbol.y = symbol.y + step.value.dy * -1
          })
        } else {
          ticker.destroy()
          resolve()
        }
      })
      ticker.start()
    })

    //new gen & ticker
    g = new this.performMove(
      0,
      0,
      0,
      yMainTarget,
      speed / (0.5 + Math.random() * 0.5)
    )
    ticker = new Ticker()

    await new Promise((resolve) => {
      const t = ticker.add((delta) => {
        step = g.next(delta)

        if (step.done === false) {
          this.symbols.forEach((symbol) => {
            //move each symbol
            symbol.y = symbol.y + step.value.dy
          })
        } else {
          ticker.destroy()
          resolve()
        }
      })
      ticker.start()
    })

    //new gen & ticker
    g = new this.performMove(
      0,
      0,
      0,
      ySoftLandingMoveUpTarget,
      speed / (4 + Math.random() * 2)
    )
    ticker = new Ticker()

    await new Promise((resolve) => {
      const t = ticker.add((delta) => {
        step = g.next(delta)

        if (step.done === false) {
          this.symbols.forEach((symbol) => {
            //move each symbol
            symbol.y = symbol.y + step.value.dy * -1
          })
        } else {
          ticker.destroy()
          resolve()
        }
      })
      ticker.start()
    })

    //new gen & ticker
    g = new this.performMove(
      0,
      0,
      0,
      ySoftLandingFinalMoveDownTarget,
      speed / (12 + Math.random() * 5)
    )
    ticker = new Ticker()

    await new Promise((resolve) => {
      const t = ticker.add((delta) => {
        step = g.next(delta)

        if (step.done === false) {
          this.symbols.forEach((symbol) => {
            //move each symbol
            symbol.y = symbol.y + step.value.dy
          })
        } else {
          ticker.destroy()
          resolve()
        }
      })
      ticker.start()
    })

    //after finish cut off everthing below bottom edge+1 in the grid
    let a = this.symbols.splice(0, this.symbols.length - 7)

    //cleanup unnecessery symbols
    a.forEach((el) => {
      el.destroy()
    })
    a = null
  }

  performMove = function* (xCurrent, yCurrent, xTarget, yTarget, speed) {
    let delta = 1

    //linear interpolation
    let prevActualDy1 = 0
    let prevActualDy2 = 0
    let prevActualDy3 = 0

    //initial path
    const initXDist = xTarget - xCurrent
    const initYDist = yTarget - yCurrent

    //remainig path
    let remainingPathX = initXDist
    let remainingPathY = initYDist

    //actual shift
    let actualDX = 0
    let actualDY = 0

    //nominal (not delta adjusted)
    let nominalDX = 0
    let nominalDY = 0

    //lerp averages
    let avg2 = 0
    let avg1 = 0

    //remainig distance in abs amount
    let pathYPerformed = 0

    //half speed
    let speedCorrection = 1

    //loop until target is reached
    while (Math.abs(remainingPathX) > 0 || Math.abs(remainingPathY) > 0) {

      //movement done
      pathYPerformed = remainingPathY / initYDist

      //get approprate speed for position
      //depending whether it is start, middle or end of movement
      switch (true) {
        case pathYPerformed >= 0 && pathYPerformed < 0.025:
          speedCorrection = 0.45
          break

        case pathYPerformed >= 0.025 && pathYPerformed < 0.05:
          speedCorrection = 0.75
          break

        case pathYPerformed >= 0.05 && pathYPerformed <= 0.95:
          speedCorrection = 1
          break
        case pathYPerformed >= 0.95 && pathYPerformed < 0.975:
          speedCorrection = 0.45
          break

        case pathYPerformed >= 0.975 && pathYPerformed <= 1:
          speedCorrection = 0.25
          break
      }

      //nominal step (non - time adjusted)
      nominalDX = speed * 10 * speedCorrection
      nominalDY = speed * 10 * speedCorrection
      
      //time-adjusted steps
      actualDX = nominalDX * delta
      actualDY = nominalDY * delta

      //average out to soften move
      avg2 = lerp(prevActualDy3, prevActualDy2, 0.45)
      avg1 = lerp(prevActualDy1, avg2, 0.35)
      actualDY = lerp(actualDY, avg1, 0.25)

      //check not to go too far away X pos
      if (Math.abs(actualDX) > Math.abs(remainingPathX)) {
        actualDX = remainingPathX
      }

      //check not to go too far away Y pos
      if (Math.abs(actualDY) > Math.abs(remainingPathY)) {
        actualDY = remainingPathY
      }

      //update how much of the move left
      remainingPathX = remainingPathX - actualDX
      remainingPathY = remainingPathY - actualDY

      //save old averages
      prevActualDy3 = prevActualDy2
      prevActualDy2 = prevActualDy1
      prevActualDy1 = actualDY

      //return value & get new delta
      delta = yield { dx: actualDX, dy: actualDY }
    }
  }

  onMainMoveStart = () => {
    this.symbols.forEach((s) => (s.filters = [this.blurFilter]))
  }

  onMainMoveEnd = () => {
    this.symbols.forEach((s) => (s.filters = []))
  }
}
