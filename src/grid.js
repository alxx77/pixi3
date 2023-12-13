import { Sprite, Container, Texture } from "pixi.js"

import { Reel } from "./reel.js"

import { state } from "./state.js"

const reelIds = [0, 1, 2, 3, 4]

const stripeLength = 21

export class Grid {
  constructor(slotMachine) {
    this.slotMachine = slotMachine
    this.container = new Container()
    slotMachine.stage.addChild(this.container)
    this.container.name = "Grid"
    this.reels = []

    const mask = new Sprite(Texture.WHITE)
    mask.name = "Grid mask"
    mask.width = 1225
    mask.height = 1225
    mask.x = 10

    this.container.addChild(mask)
    this.container.mask = mask
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
      //get new (random) symbol stripe
      const stripe = this.slotMachine.getSymbolStripe(stripeLength)

      //insert new round data into stripe, leaving 1 random element at the end of stripe
      //because of soft landing effect
      stripe.splice(stripe.lenght-2,0,...round.reels[reel.reelId])

      //update reel symbols
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
      promises.push(reels[reelId].spinReel2(3))
    }

    //wait for all reels to stop
    await Promise.all(promises)
  }
}
