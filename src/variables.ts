import { TextStyle } from "pixi.js"

export const reelIds = [0, 1, 2, 3, 4]

export const stripeLength = 21

export const reelHeight = 5

export const symbolStripeLength = 200

export const spinSpeed = 25

export const spinReelTimeout = 1000

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
    fill: "#d69b33",
    dropShadow: true,
    dropShadowColor: 'red',
    dropShadowDistance:5
  }),
  gamePanelWin: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "72px",
    fill: "white",
    dropShadow: true,
    dropShadowColor: 'red',
    dropShadowDistance:5
  }),
  gamePanelBet: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "48px",
    fill: "white",
    dropShadow: true,
    dropShadowColor: 'red',
    dropShadowDistance:5
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
  skipFeatureText: new TextStyle({
    fontFamily: "Troika ",
    fontSize: "42px",
    fill: "#dbc8c8",
    dropShadow: true,
    dropShadowColor: 'red',
    dropShadowDistance:5
  }),
}

export const soundSource = {
  clickButton: "assets/spin-button_click.mp3",
  clickReel: "assets/reel_spinning_click.mp3",
  accent: "assets/accent.mp3",
  midWin: "assets/mid_win.mp3",
  ambience: "assets/casino_ambience1.mp3"
}
