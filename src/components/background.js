import { Container,Sprite,Texture } from "pixi.js"

export class Background extends Container {
constructor(){
    super()
    this.backgroundSprite = null
}

init(){
    this.backgroundSprite = new Sprite(Texture.EMPTY)
    this.backgroundSprite.name = "background"
    this.addChild(this.backgroundSprite)
}

updateLayout(width,height){
    this.width = width
    this.height = height
    this.backgroundSprite.width = width
    this.backgroundSprite.height = height
}


}

