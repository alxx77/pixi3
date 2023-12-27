import { InitGame } from "./initGame"
import { SlotMachine } from "./slotMachine"
import '../styles/main.scss'

//start game
(async ()=>{
//initialize
const data = await InitGame()

//get slot machine instance & transfer control
const sm = new SlotMachine(data.layout, data.renderer)
})()
