"use client"

import { useState, useEffect } from "react"
import { useStarknetStore } from "@/lib/starknet-store"
import { useGameStore } from "@/lib/game-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Trophy, Users, TrendingUp, Loader2 } from "lucide-react"

export function WalletConnector() {
  const {
    isConnected,
    walletAddress,
    isLoading,
    transactionStatus,
    userHighScore,
    playerStats,
    leaderboard,
    connectWallet,
    disconnectWallet,
    refreshUserData,
  } = useStarknetStore()

  const { setBestScore } = useGameStore()

  // Update game store when wallet high score changes
  useEffect(() => {
    if (isConnected && userHighScore > 0) {
      setBestScore(userHighScore)
    }
  }, [isConnected, userHighScore, setBestScore])

  // Refresh user data when wallet connects
  useEffect(() => {
    if (isConnected) {
      refreshUserData()
    }
  }, [isConnected, refreshUserData])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "accepted":
        return "bg-green-500/20 text-green-700 border-green-500/30"
      case "failed":
        return "bg-red-500/20 text-red-700 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30"
    }
  }

  if (!isConnected) {
    return (
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-white">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription className="text-white/70">
            Connect your wallet to track your high scores on-chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Wallet Status */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connected
            </div>
            <Button
              onClick={disconnectWallet}
              size="sm"
              variant="outline"
              className="border-red-400/50 text-red-300 bg-red-500/10 hover:bg-red-500/20 hover:text-red-200 hover:border-red-300/70"
            >
              Disconnect
            </Button>
          </CardTitle>
          <CardDescription className="text-white/70">
            {formatAddress(walletAddress!)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Transaction Status */}
          {transactionStatus && (
            <Badge className={`${getTransactionStatusColor(transactionStatus)} capitalize`}>
              {transactionStatus === "pending" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              Transaction {transactionStatus}
            </Badge>
          )}

          {/* User Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{userHighScore.toLocaleString()}</div>
              <div className="text-xs text-white/70 flex items-center justify-center gap-1">
                <Trophy className="h-3 w-3" />
                Your Best Score
              </div>
            </div>
            {playerStats && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{playerStats.games_played}</div>
                <div className="text-xs text-white/70">Games Played</div>
              </div>
            )}
          </div>

          {/* Player Stats Details */}
          {playerStats && (
            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-sm font-medium text-white">{playerStats.current_score.toLocaleString()}</div>
                  <div className="text-xs text-white/60">Current</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{playerStats.best_score.toLocaleString()}</div>
                  <div className="text-xs text-white/60">Best</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{playerStats.moves.toLocaleString()}</div>
                  <div className="text-xs text-white/60">Moves</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5" />
              Global Leaderboard
            </CardTitle>
            <CardDescription className="text-white/70">
              Top players worldwide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.player}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    entry.player === walletAddress
                      ? "bg-yellow-500/20 border border-yellow-500/30"
                      : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? "bg-yellow-500 text-black" :
                      index === 1 ? "bg-gray-400 text-black" :
                      index === 2 ? "bg-yellow-600 text-white" :
                      "bg-gray-600 text-white"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {entry.player === walletAddress ? "You" : formatAddress(entry.player)}
                      </div>
                      {entry.moves > 0 && (
                        <div className="text-xs text-white/60">{entry.moves} moves</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{entry.score.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 