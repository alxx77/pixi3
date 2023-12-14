import { Grid } from "./components/grid.js"

import { state } from "./state.js"

import { getRounds } from "./server.js"

import { symbolList } from "./initAssets.js"

import { Background } from "./components/background.js"
import { GamePanel } from "./components/gamePanel.js"

const reelIds = [0, 1, 2, 3, 4]



export class SlotMachine {
  constructor() {
    this.layout = state.layout
    state.slotMachine = this
  }

  init() {
    //parse initial symbol stripes
    state.initialStripes = []
    state.isPlayingRound = false
    reelIds.forEach(() => {
      state.initialStripes.push(this.getSymbolStripe(7))
    })

    //set initial layout container size
    this.layout.width = document.documentElement.clientWidth
    this.layout.height = document.documentElement.clientHeight

    //initialize background
    this.background = new Background()
    this.layout.addChild(this.background)
    this.background.init()

    //initialize grid
    this.grid = new Grid()
    this.layout.addChild(this.grid)
    this.grid.init()

    //initialize game panel
    this.gamePanel = new GamePanel()
    this.layout.addChild(this.gamePanel)
    this.gamePanel.init()

    const updateView = this.updateView

    //resize event
    window.addEventListener("resize", updateView)

    //change device orientation
    window.addEventListener("orientationchange", updateView)

    updateView()
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
          }, 750)
        })
      }
    }

    state.isPlayingRound = false
    console.log("play finished")

    //const wf = new Winfeedback("win",this.stage)

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

  //recalc view
  updateView = () => {
    let w = document.documentElement.clientWidth

    let h = document.documentElement.clientHeight

    //resize
    state.renderer.resize(w, h)

    //update components
    state.layout.updateLayout(w, h)
  }
}
