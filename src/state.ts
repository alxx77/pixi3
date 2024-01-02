import { SlotMachine, WinSymbolList } from "./slotMachine"
import { Layout } from "./components/layout"
import { User, Response, Round } from "./server"
import { action, makeAutoObservable, computed, makeObservable } from "mobx"
import { Renderer } from "pixi.js"
import { Background } from "./components/background"
import { Effects } from "./components/effects"
import { GamePanel } from "./components/gamePanel"
import { Grid } from "./components/grid"
import { Reel } from "./components/reel"
import { WinBoard } from "./components/winBoard"
import { Winfeedback } from "./components/winFeedback"

class Store {
  _initialStripes: string[][]
  _isPlayingRound: boolean
  _user: User
  _response: Response
  _winFeedbackVisible: boolean
  _skipFeature: boolean
  _winAmount: number
  _winSymbolsPerRound: WinSymbolList[]
  _winRunningTotal: number
  _currentRound: Round
  _spaceBarKeyDown: boolean
  _playRoundRequest:boolean

  constructor() {
    this._initialStripes = []
    this._isPlayingRound = false
    this._winFeedbackVisible = false
    this._user = {} as User
    this._response = {} as Response
    this._skipFeature = false
    this._winAmount = 0
    this._winSymbolsPerRound = {} as WinSymbolList[]
    this._winRunningTotal = 0
    this._currentRound = {} as Round
    this._spaceBarKeyDown = false
    this._playRoundRequest = false
    makeAutoObservable(this)
  }

  //stripes
  @action
  addInitialStripe(stripe: string[]) {
    this.initialStripes.push(stripe)
  }
  @computed
  get initialStripes(): string[][] {
    return this._initialStripes
  }

  //round playing
  @action
  setIsPlayingRound(value: boolean) {
    this._isPlayingRound = value
    console.log("is round playing: " + this._isPlayingRound)
  }
  @computed
  get isPlayingRound(): boolean {
    return this._isPlayingRound
  }

  //skip feature
  @action
  setSkipFeature(value: boolean) {
    this._skipFeature = value
    console.log("setSkipFeature: " + this._skipFeature)
  }
  @computed
  get skipFeature(): boolean {
    return this._skipFeature
  }

  //user
  @action
  setUser(user: User) {
    this._user = user
  }
  @computed
  get user(): User {
    return this._user
  }

  //user-credit
  @action
  setUserCreditAmount(amount: number) {
    this._user.credit_amt = amount
  }

  @action
  setUserBetAmount(amount: number) {
    this._user.bet_amt = amount
  }

  //winfeedback
  @action
  setWinFeedbackVisible(value: boolean) {
    this._winFeedbackVisible = value
  }
  @computed
  get winFeedbackVisible(): boolean {
    return this._winFeedbackVisible
  }

  @action
  setResponse(response: Response) {
    this._response = response
  }

  @computed
  get response(): Response {
    return this._response
  }

  @action
  setWinAmount(amount: number) {
    this._winAmount = amount
  }
  @computed
  get winAmount(): number {
    return this._winAmount
  }

  @action
  setWinSymbolsPerRound(list: WinSymbolList[]) {
    this._winSymbolsPerRound = list
  }
  @computed
  get winSymbolsPerRound(): WinSymbolList[] {
    return this._winSymbolsPerRound
  }

  @action
  setWinRunningTotal(value: number) {
    this._winRunningTotal = value
  }
  @computed
  get winRunningTotal(): number {
    return this._winRunningTotal
  }

  @action
  setCurrentRound(round: Round) {
    this._currentRound = round
    console.log("Current round: " + this._currentRound.spin)
  }
  @computed
  get currentRound(): Round {
    return this._currentRound
  }

  @action
  setSpaceBarKeyDown(value: boolean) {
    this._spaceBarKeyDown = value
  }
  @computed
  get isSpaceBarKeyDown(): boolean {
    return this._spaceBarKeyDown
  }

  @action
  setPlayRoundRequest(value: boolean) {
    this._playRoundRequest = value
  }

  @computed
  get playRoundRequest(): boolean {
    return this._playRoundRequest
  }

}

export const state = new Store()

type Components = {
  slotMachine: SlotMachine
  renderer: Renderer
  layout: Layout
  background: Background
  effects: Effects
  gamePanel: GamePanel
  grid: Grid
  reel: Reel
  winBoard: WinBoard
  winFeedback: Winfeedback
}

export const components = {} as Components
