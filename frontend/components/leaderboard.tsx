"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, RefreshCw, Crown } from "lucide-react"
import { useLeaderboard } from "@/hooks/use-leaderboard"
import { useWallet } from "@/hooks/use-wallet"

export function Leaderboard() {
  const { leaderboard, refreshLeaderboard, getPlayerRank, isEmpty } = useLeaderboard()
  const { walletAddress, formatAddress } = useWallet()

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-orange-500" />
      default:
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">{rank}</span>
          </div>
        )
    }
  }

  const isCurrentPlayer = (playerAddress: string) => {
    return walletAddress && playerAddress.toLowerCase() === walletAddress.toLowerCase()
  }

  const currentPlayerRank = getPlayerRank(walletAddress)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-600" />
            Global Leaderboard
          </CardTitle>
          <Button 
            onClick={refreshLeaderboard} 
            variant="ghost" 
            size="sm"
            className="gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        {currentPlayerRank && (
          <div className="text-sm text-muted-foreground">
            Your rank: #{currentPlayerRank}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No scores yet</p>
            <p className="text-sm">Be the first to save a score to Starknet!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const rank = index + 1
              const isCurrentUser = isCurrentPlayer(entry.player)
              
              return (
                <div 
                  key={`${entry.player}-${entry.score}`}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isCurrentUser 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getRankIcon(rank)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm font-mono">
                          {formatAddress(entry.player)}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      {entry.moves > 0 && (
                        <div className="text-xs text-gray-500">
                          {entry.moves} moves
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      rank === 1 ? 'text-yellow-600' : 
                      rank === 2 ? 'text-gray-600' : 
                      rank === 3 ? 'text-orange-600' : 
                      'text-gray-800'
                    }`}>
                      {entry.score.toLocaleString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t text-center">
          <p className="text-xs text-gray-500">
            Leaderboard updates automatically when scores are saved
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
