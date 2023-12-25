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

    //save target position
    //so dynamic tweening works
    this.targetPos = { x: xPos, y: yPos }

    return new Promise((resolve) => {
      this.tween = this.getTween(totalTime)

      this.tween.onComplete(() => {
        resolve()
      })
      this.tween.start()
    })
  }

  getTween = (totalTime) => {
    return new TWEEN.Tween(this)
      .to(this.targetPos, totalTime)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .dynamic(true)
  }

  updateMove(point) {
    this.targetPos.x = point.x
    this.targetPos.y = point.y
  }
}
