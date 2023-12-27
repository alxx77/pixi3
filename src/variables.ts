import { TextStyle } from "pixi.js"

export const reelIds = [0, 1, 2, 3, 4]

export const stripeLength = 21

export const reelHeight = 5

//font styles
export const fontStyles = {
  effectsFlyingMulti: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "64px",
    fill: "red",
  }),
  effectsFlyingMultiOutline: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "72px",
    fill: "gray",
  }),

  gamePanelCredit: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "64px",
    fill: "yellow",
  }),
  gamePanelWin: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "72px",
    fill: "white",
  }),
  gamePanelBet: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "48px",
    fill: "white",
  }),

  winFeedbackText: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "64px",
    fill: "red",
  }),

  winBoardLabel: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "64px",
    fill: "orange",
  }),
  winBoardMulti: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "96px",
    fill: "orange",
  }),
}

export const soundSource = {
  clickButton: "assets/spin-button_click.mp3",
  clickReel: "assets/reel_spinning_click.mp3",
  accent: "assets/accent.mp3",
  midWin: "assets/mid_win.mp3",
  ambience: "assets/casino_ambience1.mp3"
}
