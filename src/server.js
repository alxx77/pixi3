import { symbolList } from "./initAssets.js"

import { reelIds, reelHeight } from "./initGame.js"

// const response = {
//   playerBalance: 5000,
//   rounds: [
//     {
//       spin: 1,
//       betAmount: 20,
//       reels: [
//         ["H1", "H2", "M1", "M1", "H3"],
//         ["M3", "H2", "L1", "M2", "L6"],
//         ["L2", "L3", "M1", "H3", "M1"],
//         ["H1", "L4", "L5", "H3", "M2"],
//         ["H2", "M2", "M1", "L1", "M1"],
//       ],
//       paylines: [
//         { line: [0, 0, 0, 0, 0], win: 50 },
//         { line: [1, 1, 1, 1, 1], win: 100 },
//         { line: [2, 2, 2, 2, 2], win: 150 },
//       ],
//       bonusRound: false,
//       totalWin: 300,
//     },
//     {
//       spin: 2,
//       betAmount: 20,
//       reels: [
//         ["M1", "M2", "L2", "M3", "L1"],
//         ["L2", "H1", "L6", "M2", "L3"],
//         ["L4", "H3", "L5", "M1", "L2"],
//         ["L1", "H2", "H3", "L6", "M3"],
//         ["H1", "H2", "L2", "M1", "L5"],
//       ],
//       paylines: [
//         { line: [0, 0, 1, 1, 1], win: 40 },
//         { line: [1, 1, 0, 1, 0], win: 25 },
//         { line: [2, 2, 2, 2, 2], win: 150 },
//       ],
//       bonusRound: false,
//       totalWin: 215,
//     },
//   ],
// }

//get random symbols stripe
export function getSymbolStripe(stripeLength) {
  const arr = []
  for (let index = 0; index < stripeLength; index++) {
    const symbolName = symbolList[Math.floor(getRandomFloat() * 12)]
    arr.push(symbolName)
  }
  return arr
}

// Function to generate a random float between 0 (inclusive) and 1 (exclusive)
function getRandomFloat() {
  // Create an array to store the random values
  const randomValues = new Uint32Array(1)

  // Use window.crypto.getRandomValues to fill the array with random values
  window.crypto.getRandomValues(randomValues)

  // Normalize the random integer to a floating-point number in [0, 1)
  const randomFloat = randomValues[0] / 2 ** 32

  return randomFloat
}

//test response
export function getResponse() {
  const response = {}

  response.playerBalance = 5000

  response.rounds = []

  // 3 rounds game
  for (const round of [1, 2, 3]) {
    const newRound = {}

    //spin 
    newRound.spin = round
    newRound.reels = []

    //for each reel
    for (const id of reelIds) {
      const newReel = []

      for (let index = 0; index < reelHeight; index++) {
        //get
        const symbolName = symbolList[Math.floor(getRandomFloat() * 12)]

        newReel.push(symbolName)
      }

      newRound.reels.push(newReel)
    }

    //add round to list
    response.rounds.push(newRound)

  }

  return response
}
