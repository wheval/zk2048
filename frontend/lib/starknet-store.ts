"use client"

import { create } from "zustand"

interface LeaderboardEntry {
  player: string
  score: number
  moves: number
  timestamp: number
}

interface StarknetState {
  isConnected: boolean
  walletAddress: string | null
  isLoading: boolean
  transactionStatus: "pending" | "accepted" | "failed" | null
  leaderboard: LeaderboardEntry[]
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  saveScore: (score: number, moves: number) => Promise<void>
  fetchLeaderboard: () => Promise<void>
}

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  { player: "0x1234567890abcdef1234567890abcdef12345678", score: 15420, moves: 342, timestamp: Date.now() - 86400000 },
  { player: "0xabcdef1234567890abcdef1234567890abcdef12", score: 12850, moves: 298, timestamp: Date.now() - 172800000 },
  { player: "0x567890abcdef1234567890abcdef1234567890ab", score: 11200, moves: 445, timestamp: Date.now() - 259200000 },
  { player: "0xcdef1234567890abcdef1234567890abcdef1234", score: 9876, moves: 387, timestamp: Date.now() - 345600000 },
  { player: "0x234567890abcdef1234567890abcdef123456789", score: 8654, moves: 421, timestamp: Date.now() - 432000000 },
  { player: "0x890abcdef1234567890abcdef1234567890abcde", score: 7432, moves: 356, timestamp: Date.now() - 518400000 },
  { player: "0xdef1234567890abcdef1234567890abcdef12345", score: 6210, moves: 289, timestamp: Date.now() - 604800000 },
  { player: "0x4567890abcdef1234567890abcdef1234567890a", score: 5988, moves: 467, timestamp: Date.now() - 691200000 },
  { player: "0x0abcdef1234567890abcdef1234567890abcdef1", score: 4766, moves: 398, timestamp: Date.now() - 777600000 },
  { player: "0xf1234567890abcdef1234567890abcdef1234567", score: 3544, moves: 334, timestamp: Date.now() - 864000000 },
]

export const useStarknetStore = create<StarknetState>((set, get) => ({
  isConnected: false,
  walletAddress: null,
  isLoading: false,
  transactionStatus: null,
  leaderboard: mockLeaderboard,

  connectWallet: async () => {
    set({ isLoading: true })

    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock successful connection
    const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)
    set({
      isConnected: true,
      walletAddress: mockAddress,
      isLoading: false,
    })
  },

  disconnectWallet: () => {
    set({
      isConnected: false,
      walletAddress: null,
      transactionStatus: null,
    })
  },

  saveScore: async (score: number, moves: number) => {
    const { isConnected, walletAddress } = get()
    if (!isConnected || !walletAddress) return

    set({ isLoading: true, transactionStatus: "pending" })

    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock successful transaction
    const success = Math.random() > 0.1 // 90% success rate

    if (success) {
      set({ transactionStatus: "accepted" })

      // Update leaderboard with new score
      const newEntry: LeaderboardEntry = {
        player: walletAddress,
        score,
        moves,
        timestamp: Date.now(),
      }

      const currentLeaderboard = get().leaderboard
      const updatedLeaderboard = [...currentLeaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10)

      set({ leaderboard: updatedLeaderboard })
    } else {
      set({ transactionStatus: "failed" })
    }

    set({ isLoading: false })

    // Clear transaction status after 3 seconds
    setTimeout(() => {
      set({ transactionStatus: null })
    }, 3000)
  },

  fetchLeaderboard: async () => {
    // In a real implementation, this would fetch from Starknet
    // For now, we use the mock data
    set({ leaderboard: mockLeaderboard })
  },
}))
