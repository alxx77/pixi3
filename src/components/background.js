import { Container,Sprite,Texture, utils } from "pixi.js"

export class Background extends Container {
constructor(){
    super()
    this.backgroundSprite = null
}

init(){
    this.backgroundSprite = new Sprite(utils.TextureCache['main_background'])
    this.backgroundSprite.name = "background"
    this.addChild(this.backgroundSprite)
}

updateLayout(width,height){
    this.backgroundSprite.x = -this.backgroundSprite.width/2 + width/2
    this.backgroundSprite.y = -this.backgroundSprite.height/2 + height/2

}


}

