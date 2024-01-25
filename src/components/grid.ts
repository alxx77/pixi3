import { Container } from "pixi.js"
import { Reel } from "./reel"
import { state } from "../state"
import { reelHeight, reelIds, symbolStripeLength } from "../settings"
import { SYMBOL_HEIGHT } from "../initAssets"
import Timeout, { TimeoutInstance } from "smart-timeout"

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

  updateReels() {
    //update reel symbols
    this.reels.forEach((reel) => {
      //get new stripe index for reel
      reel.stripeIndex = Math.floor(Math.random() * symbolStripeLength)

      //generate symbols
      reel.setSymbols()
    })
  }

  //spin
  async startSpinReels() {
    const promises = []
    //for each reel
    for (const reelId of reelIds) {
      //pause if not 1st reel
      if (reelId > 0) {
        await new Promise<void>((resolve) => {
          Timeout.instantiate(() => {
            resolve()
          }, Math.random() * 125)
        })
      }

      this.reels[reelId].spin = true

      //request spin start and save promise
      promises.push(this.reels[reelId].startSpinReel())
    }

    //wait for all reels to start
    await Promise.all(promises)
  }

  async stopSpinReels() {
    const promises = []
    //for each reel
    for (const reelId of reelIds) {
      //add symbols from round
      for (let i = 0; i < reelHeight; i++) {
        this.reels[reelId].addSymbol(state.currentRound.reels[reelId][i])
      }
      //add one more random
      this.reels[reelId].addSymbol(
        state.symbolStripe[this.reels[reelId].getNextStripeIndex()]
      )

      this.reels[reelId].spin = false

      //request stop and save promise
      promises.push(this.reels[reelId].stopReel())
    }

    //wait for all reels to stop
    await Promise.all(promises)

    for (const reelId of reelIds) {
      //clear non visible symbols
      for (let i = 0; i < reelHeight + 1; i++) {
        if (this.reels[reelId].symbols[0].y > 5 * SYMBOL_HEIGHT) {
          const s = this.reels[reelId].symbols.shift()
          if (s) {
            s.filters = []
            s.destroy()
          }
        }
      }
    }
  }

  AnimateWin = async () => {
    //skip animation if it is required
    if (state.skipFeature === true) return

    //get wining symbols
    const payoutsPerRoundList = state.winSymbolsPerRound

    //do flickering
    for (let i = 0; i < payoutsPerRoundList.length; i++) {
      let promises = []
      //for each payout
      for (const winSymbolEntry of payoutsPerRoundList[i].data) {
        //flicker winning symbols
        promises.push(winSymbolEntry.symbol.flicker(3, 100))
        //make a little pause after
        if (state.skipFeature === false) {
          await new Promise<void>((resolve) => {
            Timeout.instantiate(() => {
              resolve()
            }, 75 + Math.random() * 75)
          })
        }
      }

      //pause between multiple wins if not last win
      if (i < payoutsPerRoundList.length - 1) {
        if (state.skipFeature === false) {
          await new Promise<void>((resolve) => {
            Timeout.instantiate(() => {
              resolve()
            }, 75 + Math.random() * 75)
          })
        }
      }

      //wait for flickering to finish
      await Promise.all(promises)
    }
  }

  updateLayout(rendererWidth: number, rendererHeight: number) {
    const scaleFactorX = Math.max(rendererWidth, 240) / 1300
    const scaleFactorY = Math.max(rendererHeight, 240) / 1750
    const scaleFactor = Math.min(scaleFactorX, scaleFactorY)
    this.scale.set(scaleFactor)

    //set x pos
    this.x = (rendererWidth - this.width) / 2
    this.y = (rendererHeight - this.height) / 3
  }
}
