import { Ticker, Renderer, Container } from "pixi.js"

import * as TWEEN from "@tweenjs/tween.js"

import { initAssets } from "./initAssets.js"

import { state } from "./state.js"
import { Layout } from "./components/layout.js"

export const reelIds = [0, 1, 2, 3, 4]
export const reelHeight = 5

export async function InitGame() {
  //canvas
  const canvas1 = document.getElementById("mycanvas1")

  state.layout = new Layout()

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
  ticker.add((delta) => {
    //renderer
    state.renderer.render(state.layout)

    //correct for delta
    TWEEN.update(ticker.deltaTime)
  })

  ticker.start()

  //init assets
  await initAssets()
}




