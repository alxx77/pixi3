import { InitGame } from "./initGame.js"
import { SlotMachine } from "./slotMachine.js"
import '../styles/main.scss'

//initialize
await InitGame()

//get slot machine instance
const sm = new SlotMachine()

//init instance
sm.init()