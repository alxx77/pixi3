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
import {
  reelIds,
  reelHeight,
  soundSource,
  symbolStripeLength,
  spinReelTimeout,
} from "./variables"
import { Winfeedback } from "./components/winFeedback"
import { WinBoard } from "./components/winBoard"
import { Effects } from "./components/effects"
import { Howl } from "howler"
import { reaction, IReactionDisposer } from "mobx"
import { Symbol } from "./components/symbol"
import { settings } from "./settings"
import Timeout, { TimeoutInstance } from "smart-timeout"

export type WinSymbolEntry = {
  symbol: Symbol
  win: number
}

export type WinSymbolList = {
  data: WinSymbolEntry[]
}

//main high logic class
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

    //save component references
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

    //add to root container
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

    //listen for space
    window.addEventListener("keydown", function (event) {
      if (event.key === " " && state.isSpaceBarKeyDown === false) {
        state.setSpaceBarKeyDown(true)
      }
    })

    window.addEventListener("keyup", function (event) {
      // Check if space bar is released
      if (event.key === " " && state.isSpaceBarKeyDown === true) {
        state.setSpaceBarKeyDown(false)
      }
    })

    //check space bar presses
    reaction(
      () => state.isSpaceBarKeyDown,
      (newVal, oldVal) => {
        //if space bar was pressed...
        if (newVal === true && oldVal === false) {
          //check is round is playing...
          if (state.isPlayingRound === false) {
            //request to play round
            state.setPlayRoundRequest(true)
          } else {
            //request to skip feature
            state.setSkipFeature(true)
          }
        }
      }
    )

    //watch for play requests
    reaction(
      () => state.playRoundRequest,
      (newVal, oldVal) => {
        //if new request
        if (newVal === true && oldVal === false) {
          //check is round is playing...
          if (state.isPlayingRound === true) {
            //exit
            return
          } else {
            this.play()
          }
        }
      }
    )

    reaction(
      () => state.symbolStripe,
      () => {
        this.grid.updateReels()
      }
    )

    reaction(
      () => state.skipFeature,
      (newVal, oldVal) => {
        if (newVal === true && oldVal === false) {
          Timeout.reset("spin-timeout", 0)
        }
      }
    )

    //set symbol stripe
    this.setStripe()

    //set correct sizes
    this.updateView()

    const self = this

    //instantiate sounds
    this.midWinSound = new Howl({
      src: [soundSource.midWin],
      volume: settings.sound.soundFX.volume,
      loop: false,
      sprite: {
        sound1: [0, 4984],
      },
    })

    this.midWinSound.on("fade", () => {
      self.midWinSound.stop()
      self.midWinSound.volume(settings.sound.soundFX.volume)
    })

    this.ambienceSound = new Howl({
      src: [soundSource.ambience],
      volume: settings.sound.ambienceSound.volume,
      loop: true,
    })

    //repeat
    if (settings.sound.ambienceSound.play) {
      setInterval(() => {
        this.ambienceSound.play()
      }, 1000000)
      this.ambienceSound.play()
    }
  }

  //wait for winfeedback to close
  winFeedbackVisibilityChanged() {
    const promise = new Promise<void>((resolve) => {
      const disposer: IReactionDisposer = reaction(
        () => state.winFeedbackVisible,
        (newWF, oldWF) => {
          if (newWF === false && oldWF === true) {
            resolve()
            disposer()
          }
        }
      )
    })
    return promise
  }

  setStripe() {
    state.setSymbolStripe(getRandomSymbolStripe(symbolStripeLength))
  }

  //play game
  //*********************************************************************************** */
  async play() {
    if (state.user.credit_amt === 0) return

    //check if already running
    if (state.isPlayingRound === true) {
      console.log("Already playing")
      return
    }

    state.setIsPlayingRound(true)

    //get response
    const response = getResponse(state.user.bet_amt)

    //save response
    state.setResponse(response)

    //set total win to 0
    state.setWinAmount(0)

    //set running total
    state.setWinRunningTotal(0)

    //set new credit
    state.setUserCreditAmount(state.user.credit_amt - state.user.bet_amt)

    console.log("play started")
    console.log(response)

    //loop through rounds
    for (let index = 0; index < response.rounds.length; index++) {
      
      this.grid.startSpinReels()

      console.log("spin started")

      state.setCurrentRound(response.rounds[index])

      //play round
      await this.playRound()

      //if not last round put a pause
      if (index < response.rounds.length - 1) {
        await new Promise<void>((resolve) => {
          Timeout.instantiate(() => {
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
    await this.winFeedbackVisibilityChanged()

    //update credit
    updateUserCreditAmount(response.playerEndBalance)

    //update total win
    state.setWinAmount(response.totalWin)

    state.setIsPlayingRound(false)
    //reset trigger
    state.setPlayRoundRequest(false)

    //clear skip feature in case space bar was presses during winfeedback
    if (state.skipFeature === true) {
      state.setSkipFeature(false)
    }
    console.log("play finished")

    Timeout.clear('spin-timeout',true)
  }

  //play 1 round of game
  async playRound() {
    //spin for a while
    await new Promise<void>((resolve) => {
      Timeout.instantiate(
        "spin-timeout",
        () => {
          resolve()
        },
        spinReelTimeout
      )
    })

    //...then stop reels
    await this.grid.stopSpinReels()

    //set winning symbols
    state.setWinSymbolsPerRound(this.getWinSymbols(state.currentRound))

    //play win if any
    if (state.currentRound.winPerRound > 0) {
      //play sound
      if (state.skipFeature === false) {
        this.midWinSound.play("sound1")
      }

      //flicker symbols
      const p1 = this.grid.AnimateWin()

      //animate multiplier flying
      const p2 = this.effects.multiFlyToWinBoard()

      //wait until finished
      await Promise.all([p1, p2])

      if (this.midWinSound.playing() === true) {
        this.midWinSound.fade(settings.sound.soundFX.volume, 0, 1000)
      }
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
