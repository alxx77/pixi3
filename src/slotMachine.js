import { Grid } from "./components/grid.js"

import { Observer, Subject, state } from "./state.js"

import { getResponse, getSymbolStripe, updateCreditAmount } from "./server.js"

import { Background } from "./components/background.js"
import { GamePanel } from "./components/gamePanel.js"

import { reelHeight, reelIds } from "./initGame.js"
import { Winfeedback } from "./components/winFeedback.js"
import { WinBoard } from "./components/winBoard.js"
import { Effects } from "./components/effects.js"

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
      state.initialStripes.push(getSymbolStripe(reelHeight + 2))
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

     //initialize winfeedback
     this.winFeedback = new Winfeedback()
     this.layout.addChild(this.winFeedback)
     this.winFeedback.init()
     this.winFeedback.observerSubject = new Subject()
     this.observerWinFeedback = new Observer()
     this.winFeedback.observerSubject.addObserver(this.observerWinFeedback)

     //initialize winboard
     this.winBoard = new WinBoard()
     this.layout.addChild(this.winBoard)
     this.winBoard.init()

     //initialize effects
     this.effects = new Effects()
     this.effects.init()
     this.layout.addChild(this.effects)
    

    const updateView = this.updateView

    //resize event
    window.addEventListener("resize", updateView)

    //change device orientation
    window.addEventListener("orientationchange", updateView)

    //update bet & credit amount
    this.gamePanel.updateBetText(state.user.bet_amt)
    this.gamePanel.updateCreditText(state.user.credit_amt)
    updateView()
  }

  //play game
  async play() {
    if (state.isPlayingRound === true) return
    state.isPlayingRound = true
    const response = getResponse(state.user.bet_amt)
    //set total win to 0
    this.gamePanel.updateWinAmountText(0)
    this.winBoard.resetBoard()
    state.response = response
    const winRunningTotal = {value:0}
    //set new credit
    this.gamePanel.updateCreditText(state.user.credit_amt - state.user.bet_amt)

    console.log("play started")
    console.log(response)

    for (let index = 0; index < response.rounds.length; index++) {
      const round = response.rounds[index]

      //play round
      await this.playRound(round,winRunningTotal)

      //if not last round put a pause
      if (index < response.rounds.length - 1) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, 10)
        })
      }
    }

    //show winfeedback
    this.winFeedback.showWin(response.playerEndBalance-response.playerStartBalance)

    //wait till closed
    await new Promise(resolve => {
      this.observerWinFeedback.update = (data)=>{
        if(data==='closed'){
          resolve()
        }
      } 
    })

    //update total win
    this.gamePanel.updateWinAmountText(response.playerEndBalance-response.playerStartBalance)

    //update credit
    updateCreditAmount(response.playerEndBalance)
    //refresh credit text
    this.gamePanel.updateCreditText(state.user.credit_amt)

    state.isPlayingRound = false
    console.log("play finished")
  }

  //play 1 round of game
  async playRound(round,winRunningTotal) {

    //update symbols
    this.grid.updateGridSymbols(round)
    //spin reels
    await this.grid.spinReels()

    //play win if any
    if (round.winPerRound > 0) {
      await this.grid.AnimateWin(round)
      await this.effects.multiFlyToWinBoard(round,winRunningTotal)
    }
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
