import { Grid } from "./components/grid"
import { components, state } from "./state"
import {
  getResponse,
  getRandomSymbolStripe,
  updateUserCreditAmount,
  Round,
  User,
} from "./server"

import { Background } from "./components/background"
import { GamePanel } from "./components/gamePanel"
import { reelIds, reelHeight, soundSource } from "./variables"
import { Winfeedback } from "./components/winFeedback"
import { WinBoard } from "./components/winBoard"
import { Effects } from "./components/effects"
import { Howl } from "howler"
import { reaction, makeObservable, observable, IReactionDisposer } from "mobx"
import { Symbol } from "./components/symbol"

export type WinSymbolEntry = {
  symbol: Symbol
  win: number
}

export type WinSymbolList = {
  data: WinSymbolEntry[]
}

//main high game logic class
export class SlotMachine {
  public background: Background
  public grid: Grid
  public gamePanel: GamePanel
  public winFeedback: Winfeedback
  public winBoard: WinBoard
  public effects: Effects
  private midWinSound: Howl
  private ambienceSound: Howl

  constructor() {
    //initialize components
    this.background = new Background()
    this.grid = new Grid()
    this.gamePanel = new GamePanel()
    this.winFeedback = new Winfeedback()
    this.winBoard = new WinBoard()
    this.effects = new Effects()

    components.background = this.background
    components.grid = this.grid
    components.gamePanel = this.gamePanel
    components.winFeedback = this.winFeedback
    components.winBoard = this.winBoard
    components.effects = this.effects

    const componentList = [
      this.background,
      this.grid,
      this.gamePanel,
      this.winFeedback,
      this.winBoard,
      this.effects,
    ]

    components.layout.addChild(...componentList)

    //set up user
    const user = {
      bet_amt: 1,
      credit_amt: 5000,
    } as User

    state.setUser(user)

    //prevent this rebinding
    const updateView = this.updateView

    //resize event
    window.addEventListener("resize", updateView)

    //change device orientation
    window.addEventListener("orientationchange", updateView)

    //prevent rebind this
    const self = this

    //listen for space
    window.addEventListener("keydown", function (event) {
      // Check if the pressed key is the space bar
      if (
        event.key === " " &&
        state.isPlayingRound &&
        state.skipFeature === false &&
        state.winFeedbackVisible === false
      ) {
        state.setSkipFeature(true)
      }
    })

    //initialize symbols
    this.setInitialSymbolStripes()
    this.grid.initReelSymbols()

    this.updateView()

    this.midWinSound = new Howl({
      src: [soundSource.midWin],
      volume: 0.1,
      loop: false,
      sprite: {
        sound1: [0, 4984],
      },
    })

    this.ambienceSound = new Howl({
      src: [soundSource.ambience],
      volume: 0.3,
      loop: true,
    })

    //repeat
    // setInterval(()=>{
    //   this.ambienceSound.play()
    // },1000000)

    // this.ambienceSound.play()

    console.log(state)
  }

  //wait for winfeedback to close
  winFeedbackVisibleChanged() {
    const promise = new Promise<void>((resolve) => {
      const d: IReactionDisposer = reaction(
        () => state.winFeedbackVisible,
        (newWF,oldWF) => {
          if (newWF === false && oldWF === true) {
            resolve()
            d()
          }
        }
      )
    })
    return promise
  }

  //generate and set initial symbol stripes
  setInitialSymbolStripes() {
    //set initial symbol stripe
    reelIds.forEach(() => {
      //+2 needed for hidden bottom and top symbols
      state.addInitialStripe(getRandomSymbolStripe(reelHeight + 2))
    })
  }

  //play game
  async play() {
    if (state.user.credit_amt === 0) return

    //check if alreday running
    if (state.isPlayingRound === true) {
      console.log("Already playing")
      return
    }

    state.setIsPlayingRound(true)

    //get response
    const response = getResponse(state.user.bet_amt)

    //set total win to 0
    state.setWinAmount(0)

    //set running total
    state.setWinRunningTotal(0)

    //save response
    state.setResponse(response)

    //set new credit
    state.setUserCreditAmount(state.user.credit_amt - state.user.bet_amt)

    console.log("play started")
    console.log(response)

    //loop through rounds
    for (let index = 0; index < response.rounds.length; index++) {
      state.setCurrentRound(response.rounds[index])

      //play round
      await this.playRound()

      //if not last round put a pause
      if (index < response.rounds.length - 1) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 750)
        })
      }

      //clear skip feature if it was requested
      if (state.skipFeature === true) {
        state.setSkipFeature(false)
      }
    }

    //show winfeedback when all rounds are completed
    this.winFeedback.showWin(response.totalWin)

    //wait till closed
    await this.winFeedbackVisibleChanged()

    //update credit
    updateUserCreditAmount(response.playerEndBalance)

    //update total win
    state.setWinAmount(response.totalWin)

    state.setIsPlayingRound(false)
    console.log("play finished")
  }

  //play 1 round of game
  async playRound() {
    //update symbols
    this.grid.updateSymbols()

    //spin reels
    await this.grid.spinReels()

    //play win if any
    if (state.currentRound.winPerRound > 0) {
      //play sound
      // this.midWinSound.volume(0.1)
      // this.midWinSound.play("sound1")

      //set winning symbols
      state.setWinSymbolsPerRound(this.getWinSymbols(state.currentRound))

      //flicker symbols
      const p1 = this.grid.AnimateWin()

      //animate multiplier flying
      const p2 = this.effects.multiFlyToWinBoard()

      //wait until finished
      await Promise.all([p1, p2])

      // this.midWinSound.fade(0.1, 0, 1000)
    }
  }

  //get winning symbols
  getWinSymbols(round: Round) {
    const resultList = []

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
                symbol: this.grid.reels[plIdx].symbols[idx + 1],
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

  //recalc view
  updateView = () => {
    let w = document.documentElement.clientWidth
    let h = document.documentElement.clientHeight

    //resize
    components.renderer.resize(w, h)

    //update components
    components.layout.updateLayout(w, h)
  }
}
