import { Grid } from "./components/grid"
import { Layout } from "./components/layout"
import { Observer, state } from "./state"
import {
  getResponse,
  getRandomSymbolStripe,
  updateUserCreditAmount,
  WinRunningTotal,
  Round,
  User,
} from "./server"

import { Background } from "./components/background"
import { GamePanel } from "./components/gamePanel"
import { reelIds, reelHeight, soundSource } from "./variables"
import { Winfeedback } from "./components/winFeedback"
import { WinBoard } from "./components/winBoard"
import { Effects } from "./components/effects"
import { Renderer } from "pixi.js"
import { Howl, Howler } from "howler"

//main high game logic class
export class SlotMachine {
  private layout: Layout
  public background: Background
  public grid: Grid
  public gamePanel: GamePanel
  public winFeedback: Winfeedback
  private observerWinFeedback: Observer
  public winBoard: WinBoard
  public effects: Effects
  private renderer: Renderer
  private midWinSound: Howl
  private ambienceSound: Howl

  constructor(layout: Layout, renderer: Renderer) {
    this.layout = layout
    state.slotMachine = this

    this.renderer = renderer

    //initialize components
    this.background = new Background()
    this.grid = new Grid()
    this.gamePanel = new GamePanel()
    this.winFeedback = new Winfeedback()
    this.observerWinFeedback = new Observer()
    this.winFeedback.observerSubject.addObserver(this.observerWinFeedback)
    this.winBoard = new WinBoard()
    this.effects = new Effects()

    const componentList = [
      this.background,
      this.grid,
      this.gamePanel,
      this.winFeedback,
      this.winBoard,
      this.effects,
    ]

    this.layout.addChild(...componentList)

    //set up user
    const user = {
      bet_amt: 1,
      credit_amt: 5000,
    } as User

    //initialize state
    state.initialStripes = []
    state.isPlayingRound = false
    state.user = user
    state.layout = layout
    state.slotMachine = this

    //prevent this rebinding
    const updateView = this.updateView

    //resize event
    window.addEventListener("resize", updateView)

    //change device orientation
    window.addEventListener("orientationchange", updateView)

    //update bet & credit amount
    this.gamePanel.updateBetText(state.user.bet_amt)
    this.gamePanel.updateCreditText(state.user.credit_amt)

    //initialize symbols
    this.setInitialSymbolStripes()
    this.grid.initReelSymbols()

    this.updateView()

    this.midWinSound = new Howl({
      src: [soundSource.midWin],
      volume: 0.1,
      loop: false,
      sprite : {
        'sound1':[0,4984]
      }
    })

    this.ambienceSound = new Howl({
      src: [soundSource.ambience],
      volume: 0.3,
      loop: true,
    })

    this.ambienceSound.play()

  }

  //generate and set initial symbol stripes
  setInitialSymbolStripes() {
    //set initial symbol stripe
    reelIds.forEach(() => {
      //+2 needed for hidden bottom and top symbols
      state.initialStripes.push(getRandomSymbolStripe(reelHeight + 2))
    })
  }

  //play game
  async play() {
    //check if alreday running
    if (state.isPlayingRound === true) return
    state.isPlayingRound = true

    //get response
    const response = getResponse(state.user.bet_amt)

    //set total win to 0
    this.gamePanel.updateWinAmountText(0)
    this.winBoard.resetBoard()

    //save response
    state.response = response

    //create running total as object
    const winRunningTotal = { value: 0 } as WinRunningTotal

    //set new credit
    this.gamePanel.updateCreditText(state.user.credit_amt - state.user.bet_amt)

    console.log("play started")
    console.log(response)

    //loop through rounds
    for (let index = 0; index < response.rounds.length; index++) {
      const round = response.rounds[index]

      //play round
      await this.playRound(round, winRunningTotal)

      //if not last round put a pause
      if (index < response.rounds.length - 1) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 10)
        })
      }
    }

    //show winfeedback when all rounds are completed
    this.winFeedback.showWin(response.totalWin)

    //wait till closed
    await new Promise<void>((resolve) => {
      this.observerWinFeedback.update = (data) => {
        if (data === "closed") {
          resolve()
        }
      }
    })

    //update total win
    this.gamePanel.updateWinAmountText(response.totalWin)

    //update credit
    updateUserCreditAmount(response.playerEndBalance)

    //update credit text
    this.gamePanel.updateCreditText(state.user.credit_amt)

    state.isPlayingRound = false
    console.log("play finished")
  }

  //play 1 round of game
  async playRound(round: Round, winRunningTotal: WinRunningTotal) {
    //update symbols
    this.grid.updateSymbols(round)

    //spin reels
    await this.grid.spinReels()

    //play win if any
    if (round.winPerRound > 0) {

      //play sound
      this.midWinSound.volume(0.1)
      this.midWinSound.play('sound1')

      //flicker symbols
      const p1 = this.grid.AnimateWin(round)

      //animate multiplier flying
      const p2 = this.effects.multiFlyToWinBoard(round, winRunningTotal)

      //wait until finished
      await Promise.all([p1, p2])

      this.midWinSound.fade(0.1,0, 1000)
    }
  }

  //recalc view
  updateView = () => {
    let w = document.documentElement.clientWidth
    let h = document.documentElement.clientHeight

    //resize
    this.renderer.resize(w, h)

    //update components
    this.layout.updateLayout(w, h)
  }
}
