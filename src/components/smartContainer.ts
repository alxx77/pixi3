import { Point, Container } from "pixi.js"
import * as TWEEN from "@tweenjs/tween.js"

type TargetPos = { x: number | undefined; y: number | undefined }

export class SmartContainer extends Container {
  name: string
  private targetPos: TargetPos
  constructor() {
    super()
    this.targetPos = {} as TargetPos
    this.name = ""
  }

  //perform move to given location
  public async moveTo(xPos: number, yPos: number, speed: number) {
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

    return new Promise<void>((resolve) => {
      new TWEEN.Tween(this)
        .to(this.targetPos, totalTime)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .dynamic(true) //allow dynamic tween
        .onComplete(() => {
          resolve()
        })
        .start()
    })
  }

  //update move dinamically
  public updateMove(point: Point) {
    this.targetPos.x = point.x
    this.targetPos.y = point.y
  }
}
