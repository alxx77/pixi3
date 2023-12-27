import { Assets } from "pixi.js"

export const SYMBOL_WIDTH = 245
export const SYMBOL_HEIGHT = 245
export const REEL_X_OFFSET = SYMBOL_WIDTH

export const SYMBOL_L1_LEMON = "L1"
export const SYMBOL_L2_ORANGE = "L2"
export const SYMBOL_L3_PLUM = "L3"
export const SYMBOL_L4_CHERRY = "L4"
export const SYMBOL_L5_GRAPES = "L5"
export const SYMBOL_L6_WATERMELON = "L6"
export const SYMBOL_M1_SEVEN = "M1"
export const SYMBOL_M2_TRIPLE_SEVEN = "M2"
export const SYMBOL_M3_BELL = "M3"
export const SYMBOL_H1_CLOVER = "H1"
export const SYMBOL_H2_DOLLAR = "H2"
export const SYMBOL_H3_TRIPLE_BAR = "H3"

export const SYMBOL_NAMES = [
  SYMBOL_L1_LEMON,
  SYMBOL_L2_ORANGE,
  SYMBOL_L3_PLUM,
  SYMBOL_L4_CHERRY,
  SYMBOL_L5_GRAPES,
  SYMBOL_L6_WATERMELON,
  SYMBOL_M1_SEVEN,
  SYMBOL_M2_TRIPLE_SEVEN,
  SYMBOL_M3_BELL,
  SYMBOL_H1_CLOVER,
  SYMBOL_H2_DOLLAR,
  SYMBOL_H3_TRIPLE_BAR,
]

export const CURRENCY_SIGN = "$"

export const symbolList = [
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "L6",
  "M1",
  "M2",
  "M3",
  "H1",
  "H2",
  "H3",
]

export const symbolWeightMap = new Map([
  ["L1", 1],
  ["L2", 1],
  ["L3", 1],
  ["L4", 1],
  ["L5", 1],
  ["L6", 1],
  ["M1", 3],
  ["M2", 3],
  ["M3", 3],
  ["H1", 5],
  ["H2", 5],
  ["H3", 5],
])

async function loadAssets() {
  const manifest = {
    bundles: [
      {
        name: "symbols",
        assets: [
          { alias: "L1", src: "assets/lemon_low.png" },
          { alias: "L2", src: "assets/orange_low.png" },
          { alias: "L3", src: "assets/plum_low.png" },
          { alias: "L4", src: "assets/cherry_low.png" },
          { alias: "L5", src: "assets/grapes_low.png" },
          { alias: "L6", src: "assets/watermelon_low.png" },
          { alias: "M1", src: "assets/7_low.png" },
          { alias: "M2", src: "assets/777_low.png" },
          { alias: "M3", src: "assets/bell_low.png" },
          { alias: "H1", src: "assets/4l_clover_low.png" },
          { alias: "H2", src: "assets/dollar_low.png" },
          { alias: "H3", src: "assets/triple_bar_low.png" },

          { alias: "L1_hi", src: "assets/lemon_hi.png" },
          { alias: "L2_hi", src: "assets/orange_hi.png" },
          { alias: "L3_hi", src: "assets/plum_hi.png" },
          { alias: "L4_hi", src: "assets/cherry_hi.png" },
          { alias: "L5_hi", src: "assets/grapes_hi.png" },
          { alias: "L6_hi", src: "assets/watermelon_hi.png" },
          { alias: "M1_hi", src: "assets/7_hi.png" },
          { alias: "M2_hi", src: "assets/777_hi.png" },
          { alias: "M3_hi", src: "assets/bell_hi.png" },
          { alias: "H1_hi", src: "assets/4l_clover_hi.png" },
          { alias: "H2_hi", src: "assets/dollar_hi.png" },
          { alias: "H3_hi", src: "assets/triple_bar_hi.png" },

          { alias: "L1_low2", src: "assets/lemon_low2.png" },
          { alias: "L2_low2", src: "assets/orange_low2.png" },
          { alias: "L3_low2", src: "assets/plum_low2.png" },
          { alias: "L4_low2", src: "assets/cherry_low2.png" },
          { alias: "L5_low2", src: "assets/grapes_low2.png" },
          { alias: "L6_low2", src: "assets/watermelon_low2.png" },
          { alias: "M1_low2", src: "assets/7_low2.png" },
          { alias: "M2_low2", src: "assets/777_low2.png" },
          { alias: "M3_low2", src: "assets/bell_low2.png" },
          { alias: "H1_low2", src: "assets/4l_clover_low2.png" },
          { alias: "H2_low2", src: "assets/dollar_low2.png" },
          { alias: "H3_low2", src: "assets/triple_bar_low2.png" },
        ],
      },
      {
        name: "buttons",
        assets: [
          { alias: "spin_button", src: "assets/spin_button.png" },
          { alias: "plus_button", src: "assets/plus_button.png" },
          { alias: "minus_button", src: "assets/minus_button.png" },
        ],
      },
      {
        name: "winboards",
        assets: [
          {
            alias: "woodboard_lnd",
            src: "assets/woodboard_lnd.jpg",
          },
          {
            alias: "woodboard_prt",
            src: "assets/woodboard_prt.jpg",
          },
        ],
      },

      {
        name: "background",
        assets: [
          {
            alias: "main_background",
            src: "assets/dark-wood-grain-texture_HD.jpg",
          },
        ],
      },
      {
        name: "fonts",
        assets: [
          {
            alias: "troika",
            src: "assets/troika.otf",
          },
        ],
      },
    ],
  }

  await Assets.init({ manifest })

  console.log("manifest loaded")

  // Load a bundle...
  await Assets.loadBundle("symbols")

  await Assets.loadBundle("buttons")

  await Assets.loadBundle("background")

  await Assets.loadBundle("winboards")

  await Assets.loadBundle("fonts")
}

export async function initAssets() {
  await loadAssets()
}
