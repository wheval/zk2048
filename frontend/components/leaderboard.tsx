"use client"

import { useStarknetStore } from "@/lib/starknet-store"
import { Trophy, Medal, Award } from "lucide-react"

export function Leaderboard() {
  const { leaderboard } = useStarknetStore()

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-bold text-center mb-4 text-orange-800">🏆 Global Leaderboard</h3>
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              {getRankIcon(index + 1)}
              <div>
                <div className="font-medium text-sm">
                  {entry.player.slice(0, 6)}...{entry.player.slice(-4)}
                </div>
                <div className="text-xs text-gray-500">{entry.moves} moves</div>
              </div>
            </div>
            <div className="font-bold text-orange-800">{entry.score}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
