"use client"

import { useCallback, useEffect } from "react"
import { useStarknetStore } from "@/lib/starknet-store"

export function useLeaderboard() {
  const {
    leaderboard,
    fetchLeaderboard,
  } = useStarknetStore()

  // Auto-fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const refreshLeaderboard = useCallback(async () => {
    try {
      await fetchLeaderboard()
    } catch (error) {
      console.error("Failed to refresh leaderboard:", error)
    }
  }, [fetchLeaderboard])

  const getPlayerRank = useCallback((playerAddress: string | null) => {
    if (!playerAddress || !leaderboard.length) return null
    
    const playerIndex = leaderboard.findIndex(
      entry => entry.player.toLowerCase() === playerAddress.toLowerCase()
    )
    
    return playerIndex >= 0 ? playerIndex + 1 : null
  }, [leaderboard])

  return {
    leaderboard,
    refreshLeaderboard,
    getPlayerRank,
    isEmpty: leaderboard.length === 0,
  }
} 