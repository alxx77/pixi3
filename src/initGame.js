import {
  Ticker,
  Renderer,
  Container,
} from "pixi.js"

import * as TWEEN from "@tweenjs/tween.js"

import { initAssets } from "./initAssets.js"

import { state } from "./state.js"
import { SlotMachine } from "./slotMachine.js"

export async function InitGame() {
  //canvas
  const canvas1 = document.getElementById("mycanvas1")

  state.stage = new Container()

  state.stage.name = "MainStage"

  //renderer
  const renderer = new Renderer({
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
  globalThis.__PIXI_RENDERER__ = renderer

  
  //new ticker
  const ticker = new Ticker()
  ticker.add((delta) => {
    //renderer
    renderer.render(state.stage)

    //correct for delta
    TWEEN.update(ticker.deltaTime)
  })

  ticker.start()

  //init assets
  await initAssets()

  state.stage.scale.set(0.6)
}


