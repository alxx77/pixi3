const response = {
  playerBalance: 5000,
  rounds: [
    {
      spin: 1,
      betAmount: 20,
      reels: [
        ["H1", "H2", "M1", "M1", "H3"],
        ["M3", "H2", "L1", "M2", "L6"],
        ["L2", "L3", "M1", "H3", "M1"],
        ["H1", "L4", "L5", "H3", "M2"],
        ["H2", "M2", "M1", "L1", "M1"],
      ],
      paylines: [
        { line: [0, 0, 0, 0, 0], win: 50 },
        { line: [1, 1, 1, 1, 1], win: 100 },
        { line: [2, 2, 2, 2, 2], win: 150 },
      ],
      bonusRound: false,
      totalWin: 300,
    },
    {
      spin: 2,
      betAmount: 20,
      reels: [
        ["M1", "M2", "L2", "M3", "L1"],
        ["L2", "H1", "L6", "M2", "L3"],
        ["L4", "H3", "L5", "M1", "L2"],
        ["L1", "H2", "H3", "L6", "M3"],
        ["H1", "H2", "L2", "M1", "L5"],
      ],
      paylines: [
        { line: [0, 0, 1, 1, 1], win: 40 },
        { line: [1, 1, 0, 1, 0], win: 25 },
        { line: [2, 2, 2, 2, 2], win: 150 },
      ],
      bonusRound: false,
      totalWin: 215,
    },
  ],
}

export function getRounds() {
  return response.rounds
}
