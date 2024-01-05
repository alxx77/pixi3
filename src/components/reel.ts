import { BlurFilter, Container, Ticker, Sprite, Texture } from "pixi.js"
import { Symbol } from "./symbol"
import { REEL_X_OFFSET, SYMBOL_HEIGHT, SYMBOL_WIDTH } from "../initAssets"
import { Grid } from "./grid"
import { Howl } from "howler"
import {
  soundSource,
  reelHeight,
  spinSpeed,
  symbolStripeLength,
} from "../variables"
import { state } from "../state"

//linear interpolation
const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a

//single change of position
type DeltaPosition = { dx: number; dy: number }

type TargetPosition = { x: number; y: number }

type GeneratorInput = { delta: number; position: TargetPosition | undefined }

//reel class
export class Reel extends Container {
  private grid: Grid
  public name: string
  public symbols: Symbol[]
  public reelId: number
  private xOffset: number
  private blurFilter: BlurFilter
  clickReelSound: Howl
  stripeIndex: number
  spin: boolean
  private frameCounter: number
  private spinSpeed : number
  constructor(grid: Grid, reelId: number) {
    super()
    this.grid = grid
    this.name = "reel " + reelId
    this.grid.addChild(this)
    this.symbols = []
    this.reelId = reelId
    this.xOffset = reelId * REEL_X_OFFSET
    this.blurFilter = new BlurFilter(2)
    this.stripeIndex = 0
    this.spin = false
    this.frameCounter = 0
    this.spinSpeed = 0
  
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

  getNextStripeIndex() {
    if (symbolStripeLength <= this.stripeIndex) {
      this.stripeIndex = 0
    }
    return this.stripeIndex++
  }

  setSymbols() {
    for (let index = 0; index < reelHeight + 2; index++) {
      this.addSymbol(state.symbolStripe[this.getNextStripeIndex()])
    }
  }

  //add a symbol to tail
  addSymbol(symbolName: string): Symbol {
    //create new symbol
    const newSymbol = new Symbol(symbolName)
    this.addChild(newSymbol)

    if (this.symbols.length === 0) {
      newSymbol.y = (5 - this.symbols.length) * SYMBOL_HEIGHT
    } else {
      newSymbol.y = this.symbols[this.symbols.length - 1].y + SYMBOL_HEIGHT * -1
    }

    //push into reel symbols
    this.symbols.push(newSymbol)

    return newSymbol
  }

  async startSpinReel() {
    const ySoftMoveUpTarget = SYMBOL_HEIGHT / 4

    //generator return value
    let step: IteratorResult<DeltaPosition, void>
    let ticker = new Ticker()
    const self = this

    // //get generator for 1st part of a move
    let g = this.performMove(spinSpeed / 2,{ x: 0, y: ySoftMoveUpTarget } , self)

    this.spin = false

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

    console.log('reel end 1')

    this.spinSpeed = spinSpeed / (0.5 + Math.random() * 0.5)

    //new gen & ticker for 2nd part of move
    g = this.performMove(this.spinSpeed, undefined, self)
    this.spin = true

    //start blur
    this.applyBlur()

    ticker = new Ticker()

    //add new cb to a ticker
    //and loop until generator is done
    //when gen. is done, destroy cb
    await new Promise<void>((resolve) => {
      ticker.add((delta) => {
        this.frameCounter++
        step = g.next(delta)
        if (step.done === false) {
          if (step.value) {
            let symbolsToAdd = 0

            const tailYPosition = self.symbols[self.symbols.length - 1].y

            const conditionToAddSymbol =
              Math.abs(tailYPosition + step.value.dy) < SYMBOL_HEIGHT &&
              tailYPosition < 0

            //if condition is met add symbols
            if (conditionToAddSymbol) {
              //how many symbols should be added
              symbolsToAdd = Math.floor(step.value.dy / SYMBOL_HEIGHT) + 1

              //add symbols to reel
              for (let i = 0; i < symbolsToAdd; i++) {
                const s = self.addSymbol(
                  state.symbolStripe[self.getNextStripeIndex()]
                )
                s.filters = [this.blurFilter]
              }
            }

            this.symbols.forEach((symbol) => {
              //move each symbol
              if (step.value) {
                symbol.y = symbol.y + step.value.dy
              }
            })

            //clear non visible symbols
            for (let i = 0; i < symbolsToAdd; i++) {
              if (self.symbols[0].y > 5 * SYMBOL_HEIGHT) {
                const s = self.symbols.shift()
                if (s) {
                  s.filters = []
                  s.destroy()
                }
              }
            }
          }
        } else {
          ticker.destroy()
        }
      })
      ticker.start()
      resolve()
    })
  }

  async stopReel(){

    //generator return value
     let step: IteratorResult<DeltaPosition, void>
     let ticker = new Ticker()
     const self = this

    const tailYPosition = self.symbols[self.symbols.length - 2].y

    const g = this.performMove(this.spinSpeed,{ x: 0, y: tailYPosition * -1 }, self)

    this.spin = false

    await new Promise<void>((resolve) => {
      ticker.add((delta) => {
        step = g.next(delta)
        if (step.done === false) {
          this.symbols.forEach((symbol) => {
            //move each symbol
            if (step.value) {
              symbol.y = symbol.y + step.value.dy
            }
          })
        } else {
          ticker.destroy()
          resolve()
        }
      })
      ticker.start()
    })

    this.spinSpeed = 0
  }



  //new gen & ticker for 3rd part of move
  // g = this.performMove(
  //   0,
  //   0,
  //   0,
  //   ySoftLandingMoveUpTarget,
  //   speed / (4 + Math.random() * 2),
  //   self
  // )
  // ticker = new Ticker()

  // await new Promise<void>((resolve) => {
  //   const t = ticker.add((delta) => {
  //     step = g.next(delta)

  //     if (step.done === false) {
  //       this.symbols.forEach((symbol) => {
  //         //move each symbol
  //         if (step.value) {
  //           symbol.y = symbol.y + step.value.dy * -1
  //         }
  //       })
  //     } else {
  //       ticker.destroy()
  //       resolve()
  //     }
  //   })
  //   ticker.start()
  // })

  //new gen & ticker for 4th part of move
  // g = this.performMove(
  //   0,
  //   0,
  //   0,
  //   ySoftLandingFinalMoveDownTarget,
  //   speed / (12 + Math.random() * 5),
  //   self
  // )
  // ticker = new Ticker()

  // await new Promise<void>((resolve) => {
  //   const t = ticker.add((delta) => {
  //     step = g.next(delta)

  //     if (step.done === false) {
  //       this.symbols.forEach((symbol) => {
  //         //move each symbol
  //         if (step.value) {
  //           symbol.y = symbol.y + step.value.dy
  //         }
  //       })
  //     } else {
  //       this.clickReelSound.play()
  //       ticker.destroy()
  //       resolve()
  //     }
  //   })
  //   ticker.start()
  // })


  //generator that calculates move
  performMove = function* (
    speed: number,
    target: TargetPosition | undefined,
    self: Reel
  ): Generator<DeltaPosition, void, number> {
    let delta = 1

    //linear interpolation
    let prevActualDy1 = 0
    let prevActualDy2 = 0
    let prevActualDy3 = 0

    //initial path
    let initXDist = 0
    let initYDist = 0

    //remaining path
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

    if(target){
      remainingPathX = target.x
      remainingPathY = target.y
      initXDist = remainingPathX
      initYDist = remainingPathY
    }

    //remaining distance in abs amount
    let pathYPerformed = 0

    //speed correction
    //allows different speed of reel in different stages of a move
    let speedCorrection = 1

    //loop until target is reached
    while (
      Math.abs(remainingPathX) > 0 ||
      Math.abs(remainingPathY) > 0 ||
      self.spin === true
    ) {
      //get appropriate speed for position
      //depending whether it is start, middle or end of movement
      // if (spin === false) {
      //   pathYPerformed = remainingPathY / initYDist
      //   switch (true) {
      //     case pathYPerformed >= 0 && pathYPerformed < 0.025:
      //       speedCorrection = 0.45
      //       break

      //     case pathYPerformed >= 0.025 && pathYPerformed < 0.05:
      //       speedCorrection = 0.75
      //       break

      //     case pathYPerformed >= 0.05 && pathYPerformed <= 0.95:
      //       speedCorrection = 1
      //       break
      //     case pathYPerformed >= 0.95 && pathYPerformed < 0.975:
      //       speedCorrection = 0.45
      //       break

      //     case pathYPerformed >= 0.975 && pathYPerformed <= 1:
      //       speedCorrection = 0.25
      //       break
      //   }
      // }

      //nominal step (non - time adjusted)
      nominalDX = speed * speedCorrection
      nominalDY = speed * speedCorrection

      //time-adjusted steps
      actualDX = nominalDX * delta
      actualDY = nominalDY * delta

      //average out to soften move
      avg2 = lerp(prevActualDy3, prevActualDy2, 0.45)
      avg1 = lerp(prevActualDy1, avg2, 0.35)
      actualDY = lerp(actualDY, avg1, 0.25)

      //check not to go too far away X pos
      if (self.spin === false) {
        if (Math.abs(actualDX) > Math.abs(remainingPathX)) {
          actualDX = remainingPathX
        }

        //check not to go too far away Y pos
        if (Math.abs(actualDY) > Math.abs(remainingPathY)) {
          actualDY = remainingPathY
        }
      }
      //update how much of the move left
      //if skip to final is signaled
      //just send final destination as result
      if (state.skipFeature === true && self.spin === false) {
        actualDX = remainingPathX
        actualDY = remainingPathY
      }

      if (self.spin === false) {
        remainingPathX = remainingPathX - actualDX
        remainingPathY = remainingPathY - actualDY
      }

      //save old averages
      prevActualDy3 = prevActualDy2
      prevActualDy2 = prevActualDy1
      prevActualDy1 = actualDY

      //return value & get new input data
      delta = yield { dx: actualDX, dy: actualDY }

     }
  }

  applyBlur = () => {
    this.symbols.forEach((s) => (s.filters = [this.blurFilter]))
  }

  clearBlur = () => {
    this.symbols.forEach((s) => (s.filters = []))
  }
}
