"use client"

import { useEffect, useCallback } from "react"
import { GameBoard } from "./game-board"
import { ScoreDisplay } from "./score-display"
import { WalletConnector } from "./wallet-connector"
import { Leaderboard } from "./leaderboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
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

  const {
    isConnected,
    isLoading: starknetLoading,
    transactionStatus,
    markGameCompleted,
    saveScore,
  } = useStarknetStore()

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
    if (gameOver || won) {
      await markGameCompleted(score, moves)
    } else {
      await saveScore(score, moves)
    }
  }

  const getTransactionStatusIcon = () => {
    switch (transactionStatus) {
      case "pending":
        return <Loader2 className="w-4 h-4 animate-spin" />
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getTransactionStatusMessage = () => {
    switch (transactionStatus) {
      case "pending":
        return "Saving to Starknet..."
      case "accepted":
        return "Score saved successfully!"
      case "failed":
        return "Failed to save score"
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Game Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
              zk2048
            </h1>
            <p className="text-purple-300 text-lg sm:text-xl font-medium">Powered by Starknet</p>
          </div>

          {/* Score Display */}
          <ScoreDisplay score={score} bestScore={bestScore} />

          {/* Game Board */}
          <div className="flex justify-center relative">
            <GameBoard
              board={board}
              onMove={{ up: moveUp, down: moveDown, left: moveLeft, right: moveRight }}
              disabled={gameOver}
            />
            
            {/* Game Over/Win Overlay - positioned on top of game board */}
            {(gameOver || won) && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                <Card className="w-full max-w-sm mx-4 bg-white/95 backdrop-blur border-white/50 shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">
                      {won ? "🎉" : "💀"}
                    </div>
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {won ? "You Won!" : "Game Over"}
                    </h2>
                    <p className="text-gray-600 mb-6 text-lg">
                      <span className="font-semibold">Final Score:</span> {score.toLocaleString()}
                      <br />
                      <span className="font-semibold">Moves:</span> {moves}
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={resetGame}
                        className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold rounded-2xl shadow-lg"
                      >
                        Play Again
                      </Button>
                      {isConnected && score > 0 && (
                        <Button
                          onClick={handleSaveToStarknet}
                          disabled={starknetLoading}
                          variant="outline"
                          className="w-full border-2 border-purple-200 hover:bg-purple-50 rounded-2xl"
                        >
                          {starknetLoading ? "Saving..." : "Save to Starknet"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 max-w-md mx-auto">
            <Button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 px-8 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              New Game
            </Button>
            <Button
              onClick={handleSaveToStarknet}
              disabled={!isConnected || score === 0 || starknetLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 px-8 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {starknetLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save to Starknet"
              )}
            </Button>
            
            {/* Wallet Required Message */}
            {!isConnected && (
              <Alert className="border-amber-200 bg-amber-50/50 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800">
                  Connect your wallet to save scores to Starknet
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Game Info */}
          <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center text-center">
                <div>
                  <div className="text-white/70 text-xs font-semibold tracking-wider">MOVES</div>
                  <div className="text-2xl font-bold text-white tabular-nums">{moves}</div>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-sm font-medium">Use arrow keys</div>
                  <div className="text-white/60 text-xs">or swipe to play</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Status */}
          {transactionStatus && (
            <Alert className={`max-w-md mx-auto backdrop-blur-sm shadow-lg border ${
              transactionStatus === "pending"
                ? "border-amber-200 bg-amber-50/80"
                : transactionStatus === "accepted"
                  ? "border-emerald-200 bg-emerald-50/80"
                  : "border-red-200 bg-red-50/80"
            }`}>
              <div className="flex items-center gap-3">
                {getTransactionStatusIcon()}
                <AlertDescription className={`text-sm font-medium ${
                  transactionStatus === "pending"
                    ? "text-amber-800"
                    : transactionStatus === "accepted"
                      ? "text-emerald-800"
                      : "text-red-800"
                }`}>
                  {getTransactionStatusMessage()}
                </AlertDescription>
              </div>
            </Alert>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <WalletConnector />
        </div>
      </div>
    </div>
  )
}
