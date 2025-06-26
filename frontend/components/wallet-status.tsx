"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, WifiOff, Trophy, Target, Hash, Gamepad2 } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

export function WalletStatus() {
  const { 
    isConnected, 
    walletAddress, 
    isLoading, 
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    playerBestScore,
    playerStats,
    refreshPlayerData
  } = useWallet()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <Wallet className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-gray-400" />
          )}
          Starknet Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {isConnected && walletAddress && (
              <span className="text-sm text-gray-600 font-mono">
                {formatAddress(walletAddress)}
              </span>
            )}
          </div>
          <Button
            onClick={isConnected ? disconnectWallet : connectWallet}
            variant={isConnected ? "outline" : "default"}
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? "..." : isConnected ? "Disconnect" : "Connect"}
          </Button>
        </div>

        {/* Player Stats */}
        {isConnected && playerStats && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
              <div className="text-sm font-medium text-gray-600">Best Score</div>
              <div className="text-xl font-bold text-yellow-600">
                {playerStats.best_score.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <Gamepad2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <div className="text-sm font-medium text-gray-600">Games</div>
              <div className="text-xl font-bold text-blue-600">
                {playerStats.games_played}
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!isConnected && (
          <div className="text-center py-3 text-sm text-gray-600">
            Connect your wallet to save scores to Starknet and compete on the global leaderboard
          </div>
        )}

        {/* Refresh Button for Connected Users */}
        {isConnected && (
          <Button
            onClick={refreshPlayerData}
            variant="ghost"
            size="sm"
            className="w-full text-xs"
          >
            Refresh Data
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
