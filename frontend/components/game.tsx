"use client"

import { useEffect, useCallback } from "react"
import { GameBoard } from "./game-board"
import { ScoreDisplay } from "./score-display"
import { WalletStatus } from "./wallet-status"
import { Leaderboard } from "./leaderboard"
import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/game-store"
import { useStarknetStore } from "@/lib/starknet-store"

export function Game() {
  const {
    board,
    score,
    bestScore,
    moves,
    gameOver,
    won,
    initializeGame,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    resetGame,
  } = useGameStore()

  const { saveScore, isLoading, transactionStatus } = useStarknetStore()

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          moveUp()
          break
        case "ArrowDown":
          e.preventDefault()
          moveDown()
          break
        case "ArrowLeft":
          e.preventDefault()
          moveLeft()
          break
        case "ArrowRight":
          e.preventDefault()
          moveRight()
          break
      }
    },
    [gameOver, moveUp, moveDown, moveLeft, moveRight],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  const handleSaveToStarknet = async () => {
    await saveScore(score, moves)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600 mb-2">2048</h1>
        <p className="text-indigo-500 text-lg">Powered by Starknet</p>
      </div>

      {/* Score Display */}
      <ScoreDisplay score={score} bestScore={bestScore} />

      {/* Game Board */}
      <GameBoard
        board={board}
        onMove={{ up: moveUp, down: moveDown, left: moveLeft, right: moveRight }}
        disabled={gameOver}
      />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={resetGame}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 text-lg font-semibold rounded-xl"
        >
          New Game
        </Button>
        <Button
          onClick={handleSaveToStarknet}
          disabled={isLoading || score === 0}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 text-lg font-semibold rounded-xl"
        >
          {isLoading ? "Saving..." : "Save to Starknet"}
        </Button>
      </div>

      {/* Bottom Info */}
      <div className="bg-white rounded-xl p-4 shadow-lg flex justify-between items-center">
        <span className="text-gray-600 font-medium">Moves: {moves}</span>
        <span className="text-gray-500 text-sm">Use arrow keys or swipe to play</span>
      </div>

      {/* Transaction Status */}
      {transactionStatus && (
        <div
          className={`text-center p-3 rounded-xl ${
            transactionStatus === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : transactionStatus === "accepted"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          Transaction {transactionStatus}
        </div>
      )}

      {/* Game Over/Win Modal */}
      {(gameOver || won) && (
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-3">{won ? "🎉 You Won!" : "💀 Game Over"}</h2>
          <p className="text-gray-600 mb-4 text-lg">
            Final Score: {score} | Moves: {moves}
          </p>
          <Button
            onClick={resetGame}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 text-lg font-semibold rounded-xl"
          >
            Play Again
          </Button>
        </div>
      )}

      {/* Wallet Status - Hidden for cleaner look, can be toggled */}
      <div className="hidden">
        <WalletStatus />
        <Leaderboard />
      </div>
    </div>
  )
}
