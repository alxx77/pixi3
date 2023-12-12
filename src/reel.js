import * as TWEEN from "@tweenjs/tween.js"
import { SmartContainer } from "./smartContainer.js"
import { BlurFilter } from "pixi.js"

import { Symbol } from "./symbol.js"
import { REEL_X_OFFSET, SYMBOL_HEIGHT } from "./initAssets.js"
import { state } from "./state.js"

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

  async spinReel2(speed){
        //total number of symbol shifts
        const shiftCount = this.symbols.length - 7

        //total y translation
        // height added for start and soft landing effect 2 * 0.25
        const yMainTarget = SYMBOL_HEIGHT * (shiftCount + 0.5)
    
        const ySoftMoveUpTarget = SYMBOL_HEIGHT / 4
        const ySoftLandingMoveUpTarget = SYMBOL_HEIGHT /2
        const ySoftLandingFinalMoveDownTarget = SYMBOL_HEIGHT / 4
    
        //time required
        let totalMainTime = yMainTarget * 10 * (1 / speed)
    
        let totalSoftMoveUpTime = ySoftMoveUpTarget * 10 * (1 / (speed /7))
        let totalSoftLandingMoveUpTime =
          ySoftLandingMoveUpTarget * 10 * (1 / (speed / 15))
        let totalSoftLandingFinalMoveDownTime =
          ySoftLandingFinalMoveDownTarget * 10 * (1 / (speed / 20))

        

        
        

  }



  async spinReel(speed) {
    console.log("start spin reel")

    //total number of symbol shifts
    const shiftCount = this.symbols.length - 7

    //total y translation
    // height added for start and soft landing effect 2 * 0.25
    const yMainTarget = SYMBOL_HEIGHT * (shiftCount + 0.5)

    const ySoftMoveUpTarget = SYMBOL_HEIGHT / 4
    const ySoftLandingMoveUpTarget = SYMBOL_HEIGHT /2
    const ySoftLandingFinalMoveDownTarget = SYMBOL_HEIGHT / 4

    //time required
    let totalMainTime = yMainTarget * 10 * (1 / speed)

    let totalSoftMoveUpTime = ySoftMoveUpTarget * 10 * (1 / (speed /7))
    let totalSoftLandingMoveUpTime =
      ySoftLandingMoveUpTarget * 10 * (1 / (speed / 15))
    let totalSoftLandingFinalMoveDownTime =
      ySoftLandingFinalMoveDownTarget * 10 * (1 / (speed / 20))

    //wait to finish
    await new Promise((resolve) => {
      //cannot use this because rebind
      const symbols = this.symbols
      const reelId = this.reelId

      let yPrev = 0
      let yStep = 0

      //1st move
      const softMoveUp = new TWEEN.Tween({ y: 0 })
        .to({ y: ySoftMoveUpTarget }, 50)
        //.easing(TWEEN.Easing.Quadratic.InOut) // Use quadratic easing for a smoother motion
        .onStart(()=>{
          if(reelId === 0){
            console.log('tag1: ' + (new Date() - state.startClickTimeStamp))
          }
        })
        .onUpdate((value) => {
          //calculate diff from previous point
          //beacuse we need relative shift
          yStep = value.y - yPrev
          symbols.forEach((symbol) => {
            //move each symbol
            symbol.y = symbol.y + yStep * -1
          })
          //save current value as previous
          yPrev = value.y
        })

      //2nd move
      const main = new TWEEN.Tween({ y: 0 })
        .to({ y: yMainTarget }, totalMainTime)
        .onStart(() => {
          yPrev = 0
          yStep = 0
          this.onMainMoveStart()
        })
        .easing(TWEEN.Easing.Quadratic.InOut) // Use quadratic easing for a smoother motion
        .onUpdate((value) => {
          //calculate diff from previous point
          //beacuse we need relative shift
          yStep = value.y - yPrev
          symbols.forEach((symbol) => {
            //move each symbol
            symbol.y = symbol.y + yStep
          })
          //save current value as previous
          yPrev = value.y
        })
        .onComplete(() => {
          this.onMainMoveEnd()
        })

      //3rd move
      const softLandingMoveUp = new TWEEN.Tween({ y: 0 })
        .to({ y: ySoftLandingMoveUpTarget }, totalSoftLandingMoveUpTime)
        .onStart(() => {
          yPrev = 0
          yStep = 0
        })
        .easing(TWEEN.Easing.Quadratic.InOut) // Use quadratic easing for a smoother motion
        .onUpdate((value) => {
          //calculate diff from previous point
          //beacuse we need relative shift
          yStep = value.y - yPrev
          symbols.forEach((symbol) => {
            //move each symbol
            symbol.y = symbol.y + yStep * -1
          })
          //save current value as previous
          yPrev = value.y
        })

      //4th move
      const softLandingMoveDown = new TWEEN.Tween({ y: 0 })
        .to(
          { y: ySoftLandingFinalMoveDownTarget },
          totalSoftLandingFinalMoveDownTime
        )
        .onStart(() => {
          yPrev = 0
          yStep = 0
        })
        .easing(TWEEN.Easing.Quadratic.InOut) // Use quadratic easing for a smoother motion
        .onUpdate((value) => {
          //calculate diff from previous point
          //beacuse we need relative shift
          yStep = value.y - yPrev
          symbols.forEach((symbol) => {
            //move each symbol
            symbol.y = symbol.y + yStep
          })
          //save current value as previous
          yPrev = value.y
        })
        .onComplete(() => {
          resolve()
        })

      //chain all moves
      softMoveUp.chain(main)
      main.chain(softLandingMoveUp)
      softLandingMoveUp.chain(softLandingMoveDown)

      //start
      softMoveUp.start()
    })

    //after finish cut off everthing below bottom edge+1 in the grid
    let a = this.symbols.splice(0, this.symbols.length - 7)

    //cleanup unnecessery symbols
    a.forEach((el) => {
      el.destroy()
    })
    a = null
  }

  onMainMoveStart = () => {
    this.symbols.forEach((s) => (s.filters = [this.blurFilter]))
  }

  onMainMoveEnd = () => {
    this.symbols.forEach((s) => (s.filters = []))
  }
}
