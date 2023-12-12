import { Sprite, utils } from "pixi.js"

import { Grid } from "./grid.js"

import { state } from "./state.js"

import { getRounds } from "./server.js"

import { symbolList } from "./initAssets.js"
import { Winfeedback } from "./winFeedback.js"
import { Spine } from "pixi-spine"

const reelIds = [0, 1, 2, 3, 4]

export class SlotMachine {
  constructor(stage) {
    this.stage = stage
    state.slotMachine = this
  }

  init() {
    //initialize grid
    this.grid = new Grid(this)
    state.grid = this.grid

    //parse initial symbol stripes
    state.initialStripes = []
    state.isPlayingRound = false

    reelIds.forEach(() => {
      state.initialStripes.push(this.getSymbolStripe(7))
    })

    //initialize grid
    this.grid.init()

    this.grid.container.scale.set(0.8)
    this.grid.container.x = 100

    //spin button
    const spinButton = new Sprite(utils.TextureCache["spin_button"])
    spinButton.position.set(460, 1025)
    spinButton.scale.set(0.5)
    spinButton.eventMode = "static"
    spinButton.on("mousedown", () => {
      console.log("mousedown")
      state.startClickTimeStamp =  new Date() 
      this.play()
    })
    this.stage.addChild(spinButton)
  }

  //get random symbols stripe
  getSymbolStripe(stripeLength) {
    const arr = []
    for (let index = 0; index < stripeLength; index++) {
      const symbolName = symbolList[Math.floor(Math.random() * 12)]
      arr.push(symbolName)
    }
    return arr
  }

  //play game
  async play() {
    
    if (state.isPlayingRound === true) return
    state.isPlayingRound = true
    const rounds = getRounds()

    for (let index = 0; index < rounds.length; index++) {
      const round = rounds[index]
      await this.playRound(round)

      //if not last round put a pause
      if (index < rounds.length - 1) {
        await new Promise((resolve) => {
          setTimeout(() => {
            console.log("play round pause")
            resolve()
          }, 1)
        })
      }
    }

    state.isPlayingRound = false
    console.log("play finished")

    const wf = new Winfeedback("win",this.stage)

    //wf.spine = new Spine(state.spineRsc.winfeedback_spine)
    //wf.spine.state.setAnimation(0, 'megawin_loop_fire', true)

  }

  //play 1 round of game
  async playRound(round) {
    //update symbols
    this.grid.updateGridSymbols(round)
    //spin reels
    await this.grid.spinReels()
  }
}
