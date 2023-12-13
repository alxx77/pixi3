import { Ticker, Renderer, Container } from "pixi.js"

import * as TWEEN from "@tweenjs/tween.js"

import { initAssets } from "./initAssets.js"

import { state } from "./state.js"

export async function InitGame() {
  //canvas
  const canvas1 = document.getElementById("mycanvas1")

  state.stage = new Container()

  state.stage.name = "Stage"

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

  state.renderer = renderer

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

  //state.stage.scale.set(0.6)

  //resize event
  window.addEventListener("resize", resize)

  //promena orijentacije uređaja
  window.addEventListener("orientationchange", resize)
}

//rekalkulacije veličine stejdža
const viewRecalc = (renderer) => {



  let w = document.documentElement.clientWidth

  let h = document.documentElement.clientHeight



  //promeni dimenzije renderera
  renderer.resize(w, h)

  //odnos š/v za stage
  let game_ratio = 1225/1439.5

  //-//- za renderer
  let renderer_ratio = w / h

  //nove dimenzije stage-a
  let game_height = 0
  let game_width = 0

  //ako je odnos Š/v veći kod renderera
  //znači da je on širi; tj. da je visina ograničavajući faktor
  if (renderer_ratio > game_ratio) {
    //visina igre biće jednaka visini renderera, a max 925
    game_height = Math.min(h, 850)

    //preračunaj širinu po njoj
    game_width = game_height * game_ratio
  } else {
    //ako je odnos Š/v manji kod renderera
    //znači da je on uži tj. da je širina ograničavajući faktor

    //uzima se prvo širina renderera a max 1315
    game_width = Math.min(w, 1200)-10

    //po njoj se računa visina
    game_height = game_width / game_ratio
  }

  console.log('d: ' + (w - game_width))

  //postavi dimenzije stage-a
  state.stage.width = game_width
  state.stage.height = game_height

  //margine po širini
  state.stage.x = ((w - game_width-10) / 2)

  //po visini
  if (w > h) {
    state.stage.y = (h - game_height) / 2
  } else {
    state.stage.y = Math.max(h * 0.34 - game_height / 2, 0)
  }
}

//resize funkcija
export const resize = () => {
  viewRecalc(state.renderer)
}
