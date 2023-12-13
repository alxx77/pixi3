import { InitGame } from "./initGame.js"
import { SlotMachine } from "./slotMachine.js"
import '../styles/main.scss'
import { state } from "./state.js"

//initialize
await InitGame()

//get slot machine instance
const sm = new SlotMachine(state.stage)

//init instance
sm.init()