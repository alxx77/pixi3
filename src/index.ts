import { initGame } from "./initGame"
import { SlotMachine } from "./slotMachine"
import { components } from "./state"
import "../styles/main.scss"

//start game
;(async () => {
  //initialize
  const data = await initGame()

  //an instance of slot machine can be created
  //and is taking over control & loop
  components.slotMachine = new SlotMachine()
})()
