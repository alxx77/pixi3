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
      stripe.splice(stripe.length - 2, 0, ...round.reels[reel.reelId])
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
      promises.push(reels[reelId].spinReel(3))
    }

    //wait for all reels to stop
    await Promise.all(promises)
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
      gridHeight = Math.max(height*0.75, 250)

      //recalculate width
      gridWidth = gridHeight * gridRatio
    } else {
      //if renderer aspect ratio is more narrow
      //means width is constraining factor and is calculated first
      gridWidth = Math.min(width, 1225 * scale)

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
      this.y = Math.max(height * 0.34 - gridHeight / 2, 0)
    }
  }
}
