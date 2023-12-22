import { symbolList, symbolWeightMap } from "./initAssets.js"

import { reelIds, reelHeight } from "./initGame.js"

import { state } from "./state.js"

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
export function getResponse(betAmount) {
  const response = {}

  //response
  response.playerStartBalance = state.playerBalance - betAmount
  response.betAmount = betAmount
  response.playerEndBalance = 0
  response.rounds = []
  response.totalWin = 0

  // number of rounds
  for (const round of [1, 2]) {
    const newRound = {}

    //spin
    newRound.spin = round
    newRound.reels = []
    newRound.paylines = []
    newRound.winPerRound = 0

    //for each reel create round data
    for (const id of reelIds) {
      const newReel = []

      for (let index = 0; index < reelHeight; index++) {
        //get
        const symbolName = symbolList[Math.floor(getRandomFloat() * 12)]

        newReel.push(symbolName)
      }
      newRound.reels.push(newReel)
    }

    //force 2 win in round 2
    if (round === 2) {
      newRound.reels[0][0] = "M1"
      newRound.reels[1][1] = "M1"
      newRound.reels[1][2] = "M1"
      newRound.reels[2][0] = "M1"
      newRound.reels[2][1] = "M1"
      newRound.reels[4][1] = "M1"

      // newRound.reels[0][3] = "H1"
      // newRound.reels[0][4] = "H1"
      // newRound.reels[1][4] = "H1"
      // newRound.reels[2][3] = "H1"
      // newRound.reels[2][4] = "H1"
      // newRound.reels[4][4] = "H1"
    }

    //check fo wins
    //6 or more of a kind
    //in a round
    const countMap = newRound.reels.flat(1).reduce((acc, el) => {
      acc[el] = (acc[el] ?? 0) + 1
      return acc
    }, {})

    let winPerRound = 0

    //check the list
    //there might be more that one win per round
    for (const [winSymbol, occ] of Object.entries(countMap)) {
      //if there is 6 or more of a kind
      if (occ >= 6) {
        //so each win must be separate object
        const paylinesPerSymbol = { winSymbol, data: [] }
        //create payline matrix
        //for each reel
        for (const reelId of reelIds) {
          const newReelPayline = []
          //get payline for a reel
          let winPerLine = 0
          for (const s of newRound.reels[reelId]) {
            //if there is a match
            //push symbols value or
            if (s === winSymbol) {
              let weight = symbolWeightMap.get(s)
              newReelPayline.push(weight)
              winPerLine = winPerLine + weight
              winPerRound = winPerRound + weight
            } else {
              newReelPayline.push(0)
            }
          }
          //add payline
          paylinesPerSymbol.data.push({ line: newReelPayline, win: winPerLine })
        }
        newRound.paylines.push(paylinesPerSymbol)
      }
    }

    //add round to list
    response.rounds.push(newRound)

    newRound.winPerRound = newRound.winPerRound + winPerRound

    response.totalWin = response.totalWin + winPerRound
  }

  response.playerEndBalance = response.playerStartBalance + (response.totalWin * betAmount)
  state.playerBalance = response.playerEndBalance

  return response
}

export function updateCreditAmount(credit){
  state.user.credit_amt = credit
}

export function updateBetAmount(bet){
  state.user.bet_amt = bet
}
