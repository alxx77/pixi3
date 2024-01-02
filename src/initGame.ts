import * as TWEEN from "@tweenjs/tween.js"
import { Ticker, Renderer, ICanvas } from "pixi.js"
import { initAssets } from "./initAssets"
import { Layout } from "./components/layout"
import { components } from "./state"

//initialize basic things needed
//for game itself
export async function initGame() {
  //canvas
  const canvas1 = document.getElementById("mycanvas1") as unknown as ICanvas

  //root container
  const layout = new Layout()

  //renderer
  const renderer = new Renderer({
    view: canvas1,
    //autoResize: true,
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  })

  //save layout & renderer
  components.renderer = renderer
  components.layout = layout

  //pixi chrome dev tools
  const global = globalThis as any
  global.__PIXI_STAGE__ = layout
  global.__PIXI_RENDERER__ = renderer

  //add stage & TWEEN to main ticker
  const ticker = new Ticker()
  ticker.add(() => {
    renderer.render(layout)
    TWEEN.update()
  })
  ticker.start()

  //init assets
  await initAssets()
}
