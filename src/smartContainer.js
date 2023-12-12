import * as PIXI from "pixi.js"
import * as TWEEN from "@tweenjs/tween.js"

export class SmartContainer extends PIXI.Container {
  constructor() {
    super()

  }

  async moveTo(xPos, yPos, speed) {
    // x&y distances
    let xDist = xPos - this.position.x
    let yDist = yPos - this.position.y

    //total distance traveled
    let totalDist = Math.sqrt(xDist ** 2 + yDist ** 2)

    //time required
    let totalTime = totalDist * 10 * (1 / speed)

    return new Promise((resolve) => {
      new TWEEN.Tween(this)
        .to({ x: xPos, y: yPos }, totalTime)
        //.easing(TWEEN.Easing.Quadratic.InOut) // Use quadratic easing for a smoother motion
        .onUpdate(() => {
          // Optional: Update any additional logic during the tween
        })
        .onComplete(() => {
          console.log("Tween completed!")
          resolve()
        })
        .start()
    })
  }


}
