import { Grid } from "./components/grid.js"

import { state } from "./state.js"

import { getResponse,getSymbolStripe } from "./server.js"

import { Background } from "./components/background.js"
import { GamePanel } from "./components/gamePanel.js"

import { reelHeight,reelIds } from "./initGame.js"



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
      //+2 needed for hidden bottom and top symbols
      state.initialStripes.push(getSymbolStripe(reelHeight+2))
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

  //play game
  async play() {
    if (state.isPlayingRound === true) return
    state.isPlayingRound = true
    const response = getResponse()
    state.response = response
    console.log("play started")

    for (let index = 0; index < response.rounds.length; index++) {
      const round = response.rounds[index]
      await this.playRound(round)

      //if not last round put a pause
      if (index < response.rounds.length - 1) {
        await new Promise((resolve) => {
          setTimeout(() => {
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
