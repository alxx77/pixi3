import { Ticker, Renderer } from "pixi.js"

import * as TWEEN from "@tweenjs/tween.js"

import { initAssets } from "./initAssets.js"

import { state } from "./state.js"
import { Layout } from "./components/layout.js"


export async function InitGame() {
  //canvas
  const canvas1 = document.getElementById("mycanvas1")

  state.layout = new Layout()

  state.playerBalance = 5000

  //renderer
  state.renderer = new Renderer({
    view: canvas1,
    //autoResize: true,
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio,
    autoDensity: true,
    transparent: true,
  })

  //pixi chrome dev tools
  globalThis.__PIXI_STAGE__ = state.stage
  globalThis.__PIXI_RENDERER__ = state.renderer

  //new ticker
  const ticker = new Ticker()

  ticker.add(() => {
    //renderer
    state.renderer.render(state.layout)

    //correct for delta
    TWEEN.update()
  })

  ticker.start()

  //set up user
  const user ={
    bet_amt: 1,
    credit_amt:5000
  }

  state.user =user

  //init assets
  await initAssets()
}




