import { Sprite, Container, Texture } from "pixi.js"

import { Reel } from "./reel.js"

import { state } from "../state.js"

import { getSymbolStripe } from "../server.js"

const reelIds = [0, 1, 2, 3, 4]

const stripeLength = 21

export class Grid extends Container {
  constructor() {
    super()
    this.name = "Grid"
    this.reels = []
  }

  init() {
    //init reels
    reelIds.forEach((reelId) => {
      this.reels.push(new Reel(this, reelId))
    })

    //update symbols on reels
    this.reels.forEach((reel) => {
      reel.updateSymbols(state.initialStripes[reel.reelId])
    })
  }

  //update all symbols on each reel with symbols from next round
  updateGridSymbols(round) {
    //update reel symbols
    this.reels.forEach((reel) => {
      const stripe = getSymbolStripe(stripeLength)
      //insert new round data into stripe, leaving 1 random element at the end of stripe
      //because of soft landing effect
      stripe.splice(stripe.length - 1, 0, ...round.reels[reel.reelId])
      reel.updateSymbols(stripe)
    })
  }

  async spinReels() {
    const promises = []
    const reels = this.reels
    for (const reelId of reelIds) {
      //pause if not 1st reel
      if (reelId > 0) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, Math.random() * 125)
        })
      }

      //spin reel
      promises.push(reels[reelId].spinReel(10))
    }

    //wait for all reels to stop
    await Promise.all(promises)
  }

  AnimateWin = async (round) => {
    //get wining symbols
    const winList = this.getWinSymbols(round)

    //do flickering
    for (let i = 0; i < winList.length; i++) {
      let promises = []
      for (const winline of winList[i].data) {
        promises.push(winline.symbol.flicker(3, 25))
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, 15 + Math.random() * 15)
        })
      }

      //pause between multiple wins if not last win
      if (i < winList.length - 1) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, 75 + Math.random() * 75)
        })
      }

      await Promise.all(promises)
    }
  }

  //get winning symbols
  getWinSymbols(round) {
    const winList = []
    const grid = this
    for (const winPerSymbol of round.paylines) {
      const win = { data: [] }
      winPerSymbol.data.forEach((payline, plIdx) => {
        if (payline.win > 0) {
          payline.line.forEach((i, idx) => {
            if (i > 0) {
              win.data.push({
                symbol: grid.reels[plIdx].symbols[idx + 1],
                win: i,
              })
            }
          })
        }
      })
      winList.push(win)
    }
    return winList
  }

  updateLayout(width, height) {
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
