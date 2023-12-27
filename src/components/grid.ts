import { Container } from "pixi.js"
import { Reel } from "./reel"
import { state } from "../state"
import { Round, getRandomSymbolStripe } from "../server"
import { reelIds, stripeLength } from "../variables"
import { Symbol } from "./symbol"

type WinSymbolEntry = {
  symbol: Symbol
  win: number
}

type WinSymbolList = {
  data: WinSymbolEntry[]
}

//grid class
export class Grid extends Container {
  public reels: Reel[]
  constructor() {
    super()
    this.name = "Grid"
    this.reels = []

    //init empty reels
    reelIds.forEach((reelId) => {
      this.reels.push(new Reel(this, reelId))
    })
  }

  //initialize reels
  initReelSymbols() {
    //update symbols on reels
    this.reels.forEach((reel) => {
      reel.updateSymbols(state.initialStripes[reel.reelId])
    })
  }

  //update all symbols on each reel with symbols from next round
  updateSymbols(round: Round) {
    //update reel symbols
    this.reels.forEach((reel) => {
      //get new stripe
      const stripe = getRandomSymbolStripe(stripeLength)

      //insert new round data into stripe, leaving 1 random element at the end of stripe
      //because of soft landing effect
      stripe.splice(stripe.length - 1, 0, ...round.reels[reel.reelId])
      reel.updateSymbols(stripe)
    })
  }

  //spin
  async spinReels() {
    const promises = []
    //for each reel
    for (const reelId of reelIds) {
      //pause if not 1st reel
      if (reelId > 0) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, Math.random() * 125)
        })
      }

      //spin reel and save promise
      promises.push(this.reels[reelId].spinReel(7))
    }

    //wait for all reels to stop
    await Promise.all(promises)
  }

  AnimateWin = async (round: Round) => {
    //get wining symbols
    const payoutsPerRoundList = this.getWinSymbols(round)

    //do flickering
    for (let i = 0; i < payoutsPerRoundList.length; i++) {
      let promises = []
      //for each payout
      for (const winSymbolEntry of payoutsPerRoundList[i].data) {
        //flicker winning symbols
        promises.push(winSymbolEntry.symbol.flicker(7, 125))
        //make a little pause after
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 75 + Math.random() * 75)
        })
      }

      //pause between multiple wins if not last win
      if (i < payoutsPerRoundList.length - 1) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 75 + Math.random() * 75)
        })
      }

      //wait for flickering to finish
      await Promise.all(promises)
    }
  }

  //get winning symbols
  getWinSymbols(round: Round) {
    const resultList = []
    const grid = this

    //loop through payouts
    for (const payoutPerSymbol of round.payouts) {

      //result for each win ( there can be multiple wins in a round)
      const win = { data: [] } as WinSymbolList

      //loop through multipliers for each symbol
      payoutPerSymbol.data.forEach((payline, plIdx) => {

        //if there is a win in a payline
        if (payline.win > 0) {

          //loop through payline
          payline.line.forEach((i, idx) => {

            //if there is a win for a symbol
            if (i > 0) {

              //save win data - symbol and win amount
              win.data.push({
                symbol: grid.reels[plIdx].symbols[idx + 1],
                win: i,
              } as WinSymbolEntry)
            }
          })
        }
      })
      //save
      resultList.push(win)
    }
    return resultList
  }

  updateLayout(width: number, height: number) {
    // desired w/h ratio of grid
    let gridRatio = 1

    let scale = 0.5

    // parent
    let layoutRatio = width / height

    // grid dimensions
    let gridHeight = 0
    let gridWidth = 0

    //if renderer aspect ratio is wider, game height is first calculated
    if (layoutRatio > gridRatio) {
      gridHeight = Math.max(height * 0.75, 250)

      //recalculate width
      gridWidth = gridHeight * gridRatio
    } else {
      //if renderer aspect ratio is more narrow
      //means width is constraining factor and is calculated first
      gridWidth = Math.max(Math.min(width, 1225 * scale), 240) * 0.8

      //recalculate height
      gridHeight = gridWidth / gridRatio
    }

    //set stage dimensions
    this.width = gridWidth
    this.height = gridHeight

    //set x pos
    this.x = (width - gridWidth) / 2

    //set y pos
    if (width > height) {
      this.y = (height - gridHeight) / 4
    } else {
      this.y = (height - gridHeight) / 3
      //this.y = Math.max(height * 0.34 - gridHeight / 2, 0)
    }
  }
}