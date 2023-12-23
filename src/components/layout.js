import { Container } from "pixi.js";
import { state } from "../state.js";

export class Layout extends Container{
    constructor(){
        super()
        this.name = "Layout"
    }


updateLayout(width,height){
    //first align the grid, then everything else
    state.slotMachine.grid.updateLayout(width,height)
    state.slotMachine.background.updateLayout(width,height)
    state.slotMachine.gamePanel.updateLayout(width,height)
    state.slotMachine.winFeedback.updateLayout(width,height)
    state.slotMachine.winBoard.updateLayout(width,height)
}

}