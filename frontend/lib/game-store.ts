"use client"

import { create } from "zustand"
import { useStarknetStore } from "./starknet-store"

interface GameState {
  board: number[][]
  score: number
  bestScore: number
  moves: number
  gameOver: boolean
  won: boolean
  isWalletConnected: boolean // Track wallet connection status
  initializeGame: () => void
  moveUp: () => void
  moveDown: () => void
  moveLeft: () => void
  moveRight: () => void
  resetGame: () => void
  setBestScore: (score: number) => void // Method to update best score from wallet
  handleGameEnd: (finalScore: number, moves: number) => Promise<void> // Handle game completion
}

const createEmptyBoard = (): number[][] => {
  return Array(4)
    .fill(null)
    .map(() => Array(4).fill(0))
}

const addRandomTile = (board: number[][]): number[][] => {
  const newBoard = board.map((row) => [...row])
  const emptyCells: { row: number; col: number }[] = []

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (newBoard[row][col] === 0) {
        emptyCells.push({ row, col })
      }
    }
  }

  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    newBoard[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4
  }

  return newBoard
}

const moveLeft = (board: number[][]): { board: number[][]; score: number; moved: boolean } => {
  const newBoard = board.map((row) => [...row])
  let score = 0
  let moved = false

  for (let row = 0; row < 4; row++) {
    const filteredRow = newBoard[row].filter((val) => val !== 0)
    const mergedRow: number[] = []
    let i = 0

    while (i < filteredRow.length) {
      if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
        const mergedValue = filteredRow[i] * 2
        mergedRow.push(mergedValue)
        score += mergedValue
        i += 2
      } else {
        mergedRow.push(filteredRow[i])
        i++
      }
    }

    while (mergedRow.length < 4) {
      mergedRow.push(0)
    }

    for (let col = 0; col < 4; col++) {
      if (newBoard[row][col] !== mergedRow[col]) {
        moved = true
      }
      newBoard[row][col] = mergedRow[col]
    }
  }

  return { board: newBoard, score, moved }
}

const rotateBoard = (board: number[][]): number[][] => {
  const newBoard = createEmptyBoard()
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      newBoard[col][3 - row] = board[row][col]
    }
  }
  return newBoard
}

const checkGameOver = (board: number[][]): boolean => {
  // Check for empty cells
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === 0) return false
    }
  }

  // Check for possible merges
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const current = board[row][col]
      if ((row < 3 && board[row + 1][col] === current) || (col < 3 && board[row][col + 1] === current)) {
        return false
      }
    }
  }

  return true
}

const checkWin = (board: number[][]): boolean => {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === 2048) return true
    }
  }
  return false
}

export const useGameStore = create<GameState>((set, get) => ({
  board: createEmptyBoard(),
  score: 0,
  bestScore: typeof window !== 'undefined' ? Number.parseInt(localStorage.getItem("zk2048-best") || "0") : 0,
  moves: 0,
  gameOver: false,
  won: false,
  isWalletConnected: false,

  initializeGame: () => {
    let board = createEmptyBoard()
    board = addRandomTile(board)
    board = addRandomTile(board)
    set({
      board,
      score: 0,
      moves: 0,
      gameOver: false,
      won: false,
    })
  },

  setBestScore: (score: number) => {
    set({ bestScore: score })
  },

  handleGameEnd: async (finalScore: number, moves: number) => {
    const starknetStore = useStarknetStore.getState()
    
    try {
      if (starknetStore.isConnected) {
        // Save to blockchain
        await starknetStore.markGameCompleted(finalScore, moves)
        
        // Update local best score with wallet-specific score
        set({ bestScore: starknetStore.userHighScore })
      } else {
        // Fallback to local storage if wallet not connected
        const currentBest = get().bestScore
        if (finalScore > currentBest) {
          if (typeof window !== 'undefined') {
            localStorage.setItem("zk2048-best", finalScore.toString())
          }
          set({ bestScore: finalScore })
        }
      }
    } catch (error) {
      console.error("Failed to handle game end:", error)
      // Fallback to local storage on error
      const currentBest = get().bestScore
      if (finalScore > currentBest) {
        if (typeof window !== 'undefined') {
          localStorage.setItem("zk2048-best", finalScore.toString())
        }
        set({ bestScore: finalScore })
      }
    }
  },

  moveLeft: () => {
    const { board, score: currentScore, moves, gameOver, won } = get()
    if (gameOver || won) return

    const result = moveLeft(board)
    if (!result.moved) return

    const newBoard = addRandomTile(result.board)
    const newScore = currentScore + result.score
    const newMoves = moves + 1
    const isGameOver = checkGameOver(newBoard)
    const hasWon = checkWin(newBoard)

    set({
      board: newBoard,
      score: newScore,
      moves: newMoves,
      gameOver: isGameOver,
      won: hasWon,
    })

    // Handle game end if applicable
    if (isGameOver || hasWon) {
      get().handleGameEnd(newScore, newMoves)
    }
  },

  moveRight: () => {
    const { board, score: currentScore, moves, gameOver, won } = get()
    if (gameOver || won) return

    let rotatedBoard = rotateBoard(rotateBoard(board))
    const result = moveLeft(rotatedBoard)
    if (!result.moved) return

    rotatedBoard = rotateBoard(rotateBoard(result.board))
    const newBoard = addRandomTile(rotatedBoard)
    const newScore = currentScore + result.score
    const newMoves = moves + 1
    const isGameOver = checkGameOver(newBoard)
    const hasWon = checkWin(newBoard)

    set({
      board: newBoard,
      score: newScore,
      moves: newMoves,
      gameOver: isGameOver,
      won: hasWon,
    })

    // Handle game end if applicable
    if (isGameOver || hasWon) {
      get().handleGameEnd(newScore, newMoves)
    }
  },

  moveUp: () => {
    const { board, score: currentScore, moves, gameOver, won } = get()
    if (gameOver || won) return

    let rotatedBoard = rotateBoard(rotateBoard(rotateBoard(board)))
    const result = moveLeft(rotatedBoard)
    if (!result.moved) return

    rotatedBoard = rotateBoard(result.board)
    const newBoard = addRandomTile(rotatedBoard)
    const newScore = currentScore + result.score
    const newMoves = moves + 1
    const isGameOver = checkGameOver(newBoard)
    const hasWon = checkWin(newBoard)

    set({
      board: newBoard,
      score: newScore,
      moves: newMoves,
      gameOver: isGameOver,
      won: hasWon,
    })

    // Handle game end if applicable
    if (isGameOver || hasWon) {
      get().handleGameEnd(newScore, newMoves)
    }
  },

  moveDown: () => {
    const { board, score: currentScore, moves, gameOver, won } = get()
    if (gameOver || won) return

    let rotatedBoard = rotateBoard(board)
    const result = moveLeft(rotatedBoard)
    if (!result.moved) return

    rotatedBoard = rotateBoard(rotateBoard(rotateBoard(result.board)))
    const newBoard = addRandomTile(rotatedBoard)
    const newScore = currentScore + result.score
    const newMoves = moves + 1
    const isGameOver = checkGameOver(newBoard)
    const hasWon = checkWin(newBoard)

    set({
      board: newBoard,
      score: newScore,
      moves: newMoves,
      gameOver: isGameOver,
      won: hasWon,
    })

    // Handle game end if applicable
    if (isGameOver || hasWon) {
      get().handleGameEnd(newScore, newMoves)
    }
  },

  resetGame: () => {
    get().initializeGame()
  },
}))
