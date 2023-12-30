import { BlurFilter, Container, Ticker, Sprite, Texture } from "pixi.js"
import { Symbol } from "./symbol"
import { REEL_X_OFFSET, SYMBOL_HEIGHT, SYMBOL_WIDTH } from "../initAssets"
import { Grid } from "./grid"
import { Howl } from "howler"
import { soundSource } from "../variables"
import { state } from "../state"

//linear interpolation
const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a

//single change of position
type DeltaPosition = { dx: number; dy: number }

//reel class
export class Reel extends Container {
  private grid: Grid
  public name: string
  public symbols: Symbol[]
  public reelId: number
  private xOffset: number
  private blurFilter: BlurFilter
  clickReelSound: Howl
  constructor(grid: Grid, reelId: number) {
    super()
    this.grid = grid
    this.name = "reel " + reelId
    this.grid.addChild(this)
    this.symbols = []
    this.reelId = reelId
    this.xOffset = reelId * REEL_X_OFFSET
    this.blurFilter = new BlurFilter(2)

    //mask
    const mask = new Sprite(Texture.WHITE)
    mask.width = SYMBOL_WIDTH
    mask.height = SYMBOL_HEIGHT * 5
    this.addChild(mask)
    this.mask = mask

    //set x pos relative to grid
    this.x = this.xOffset

    //sound
    this.clickReelSound = new Howl({
      src: [soundSource.clickReel],
      volume: 0.2,
      loop: false,
    })
  }

  //update symbols on reel
  updateSymbols(symbolStripe: string[]) {
    const baseHeigth = this.symbols.length

    //for each symbol name on stripe...
    symbolStripe.forEach((symbolName, idx) => {
      //create new symbol
      const newSymbol = new Symbol(symbolName)
      this.addChild(newSymbol)

      //get correct y position
      newSymbol.y = (-baseHeigth - idx + 5) * SYMBOL_HEIGHT

      //push into reel symbols
      this.symbols.push(newSymbol)
    })
  }

  //spin
  async spinReel(speed: number) {
    //total number of symbol shifts
    const shiftCount = this.symbols.length - 7

    //total y translation
    // height added for start and soft landing effect 2 * 0.25
    const yMainTarget = SYMBOL_HEIGHT * (shiftCount + 0.5)

    const ySoftMoveUpTarget = SYMBOL_HEIGHT / 4
    const ySoftLandingMoveUpTarget = SYMBOL_HEIGHT / 2
    const ySoftLandingFinalMoveDownTarget = SYMBOL_HEIGHT / 4

    //generator return value
    let step: IteratorResult<DeltaPosition, void>
    let ticker = new Ticker()
    const self = this

    //get generator for 1st part of a move
    let g = this.performMove(0, 0, 0, ySoftMoveUpTarget, speed / 2,self)

    //add new cb to a ticker
    //and loop until generator is done
    //when gen. is done, destroy cb
    await new Promise<void>((resolve) => {
      ticker.add((delta) => {
        step = g.next(delta)
        if (step.done === false) {
          this.symbols.forEach((symbol) => {
            //move each symbol
            if (step.value) {
              symbol.y = symbol.y + step.value.dy * -1
            }
          })
        } else {
          ticker.destroy()
          resolve()
        }
      })
      ticker.start()
    })

    //new gen & ticker for 2nd part of move
    g = this.performMove(
      0,
      0,
      0,
      yMainTarget,
      speed / (0.5 + Math.random() * 0.5),
      self
    )
    ticker = new Ticker()

    //start blur
    this.onMainMoveStart()

    //sound counter
    let yShift = 0
    

    await new Promise<void>((resolve) => {
      const t = ticker.add((delta) => {
        step = g.next(delta)

        if (step.done === false) {
          this.symbols.forEach((symbol) => {
            //move each symbol
            if (step.value) {
              symbol.y = symbol.y + step.value.dy

              //check if there was entire symbol shift
              //if yes, play click sound
              if(this.reelId===4 && yShift>SYMBOL_HEIGHT*25){
                this.clickReelSound.play()
                yShift = 0
              } else {
                //if no, just increment shift counter
                yShift+=step.value.dy
              }
            }
          })
        } else {
          ticker.destroy()
          resolve()
        }
      })
      ticker.start()
    })

    //stop blur
    this.onMainMoveEnd()

    //new gen & ticker for 3rd part of move
    g = this.performMove(
      0,
      0,
      0,
      ySoftLandingMoveUpTarget,
      speed / (4 + Math.random() * 2),
      self
    )
    ticker = new Ticker()

    await new Promise<void>((resolve) => {
      const t = ticker.add((delta) => {
        step = g.next(delta)

        if (step.done === false) {
          this.symbols.forEach((symbol) => {
            //move each symbol
            if (step.value) {
              symbol.y = symbol.y + step.value.dy * -1
            }
          })
        } else {
          ticker.destroy()
          resolve()
        }
      })
      ticker.start()
    })

    //new gen & ticker for 4th part of move
    g = this.performMove(
      0,
      0,
      0,
      ySoftLandingFinalMoveDownTarget,
      speed / (12 + Math.random() * 5),
      self
    )
    ticker = new Ticker()

    await new Promise<void>((resolve) => {
      const t = ticker.add((delta) => {
        step = g.next(delta)

        if (step.done === false) {
          this.symbols.forEach((symbol) => {
            //move each symbol
            if (step.value) {
              symbol.y = symbol.y + step.value.dy
            }
          })
        } else {
          this.clickReelSound.play()
          ticker.destroy()
          resolve()
        }
      })
      ticker.start()
    })

    //after finish destroy all symbols on reel below bottom edge+1 in the grid
    const a = this.symbols.splice(0, this.symbols.length - 7)
    a.forEach((el) => {
      el.destroy()
    })
  }

  //generator that calculates move
  performMove = function* (
    xCurrent: number,
    yCurrent: number,
    xTarget: number,
    yTarget: number,
    speed: number,
    reel: Reel
  ): Generator<DeltaPosition, void, number> {
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

    //speed correction
    //allows diffeent speed of reel in different stages of a move
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
      //if skip to final is signaled
      //just send final destination as result
      if(state.skipFeature === true){
        actualDX = remainingPathX
        actualDY = remainingPathY
      } 

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
