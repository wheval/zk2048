"use client"

import { create } from "zustand"
// TODO: Fix wallet imports when deploying - temporarily using mock for build
// import connect, { disconnect } from "get-starknet-core"
import { 
  Contract, 
  RpcProvider, 
  constants, 
  CallData, 
  cairo,
  shortString
} from "starknet"

interface LeaderboardEntry {
  player: string
  score: number
  moves: number
}

interface PlayerStats {
  current_score: number
  best_score: number
  moves: number
  games_played: number
}

interface StarknetState {
  isConnected: boolean
  walletAddress: string | null
  isLoading: boolean
  transactionStatus: "pending" | "accepted" | "failed" | null
  leaderboard: LeaderboardEntry[]
  playerBestScore: number
  playerStats: PlayerStats | null
  contractAddress: string
  userHighScore: number // Wallet-specific high score
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  saveScore: (score: number, moves: number) => Promise<void>
  markGameCompleted: (finalScore: number, moves: number) => Promise<void>
  fetchLeaderboard: () => Promise<void>
  fetchPlayerBestScore: () => Promise<void>
  fetchPlayerStats: () => Promise<void>
  refreshUserData: () => Promise<void>
}

// Contract configuration - Update with your deployed contract address
const CONTRACT_ADDRESS = "0x123456789abcdef" // Replace with your deployed contract address
const CONTRACT_ABI = [
  {
    "type": "interface",
    "name": "IZK2048Game",
    "items": [
      {
        "type": "function",
        "name": "save_player_score",
        "inputs": [
          {
            "name": "current_score",
            "type": "core::integer::u32"
          },
          {
            "name": "moves",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_player_best_score",
        "inputs": [
          {
            "name": "player",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_player_stats",
        "inputs": [
          {
            "name": "player",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "(core::integer::u32, core::integer::u32, core::integer::u32)"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_leaderboard",
        "inputs": [],
        "outputs": [
          {
            "type": "core::array::Array::<(core::starknet::contract_address::ContractAddress, core::integer::u32)>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_leaderboard_position",
        "inputs": [
          {
            "name": "player",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "mark_game_completed",
        "inputs": [
          {
            "name": "final_score",
            "type": "core::integer::u32"
          },
          {
            "name": "moves",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_total_games_played",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      }
    ]
  }
]

// Initialize RPC provider
const provider = new RpcProvider({
  nodeUrl: constants.NetworkName.SN_SEPOLIA, // Use Sepolia testnet
})

// Local storage key for wallet-specific high scores (fallback when offline)
const WALLET_HIGH_SCORE_KEY = "zk2048-wallet-scores"

// Helper functions for local storage
const getLocalHighScore = (walletAddress: string): number => {
  if (typeof window === 'undefined') return 0
  try {
    const scores = JSON.parse(localStorage.getItem(WALLET_HIGH_SCORE_KEY) || '{}')
    return scores[walletAddress] || 0
  } catch {
    return 0
  }
}

const saveLocalHighScore = (walletAddress: string, score: number): void => {
  if (typeof window === 'undefined') return
  try {
    const scores = JSON.parse(localStorage.getItem(WALLET_HIGH_SCORE_KEY) || '{}')
    scores[walletAddress] = Math.max(scores[walletAddress] || 0, score)
    localStorage.setItem(WALLET_HIGH_SCORE_KEY, JSON.stringify(scores))
  } catch (error) {
    console.error('Failed to save local high score:', error)
  }
}

export const useStarknetStore = create<StarknetState>((set, get) => ({
  isConnected: false,
  walletAddress: null,
  isLoading: false,
  transactionStatus: null,
  leaderboard: [],
  playerBestScore: 0,
  playerStats: null,
  contractAddress: CONTRACT_ADDRESS,
  userHighScore: 0,

  connectWallet: async () => {
    try {
      set({ isLoading: true })

      // Mock wallet connection for build compatibility
      // In production, uncomment the following and remove mock:
      /*
      const starknet = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "light",
      })

      if (!starknet) {
        throw new Error("No wallet found")
      }

      await starknet.enable()

      if (starknet.isConnected) {
        const walletAddress = starknet.selectedAddress
        
        // Get local high score as fallback
        const localHighScore = getLocalHighScore(walletAddress)
        
        set({
          isConnected: true,
          walletAddress,
          isLoading: false,
          userHighScore: localHighScore,
        })

        // Fetch on-chain data
        const { refreshUserData } = get()
        await refreshUserData()
      }
      */

      // Mock connection for build compatibility
      const mockWalletAddress = "0x1234567890abcdef1234567890abcdef12345678"
      const localHighScore = getLocalHighScore(mockWalletAddress)
      
      set({
        isConnected: true,
        walletAddress: mockWalletAddress,
        isLoading: false,
        userHighScore: localHighScore,
      })

      console.log("Mock wallet connected for build compatibility")
      
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      set({
        isConnected: false,
        walletAddress: null,
        isLoading: false,
        userHighScore: 0,
      })
    }
  },

  disconnectWallet: async () => {
    try {
      // await disconnect({ clearLastWallet: true })
      set({
        isConnected: false,
        walletAddress: null,
        transactionStatus: null,
        playerBestScore: 0,
        playerStats: null,
        userHighScore: 0,
      })
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  },

  saveScore: async (score: number, moves: number) => {
    const { isConnected, walletAddress } = get()
    if (!isConnected || !walletAddress) {
      throw new Error("Wallet not connected")
    }

    try {
      set({ isLoading: true, transactionStatus: "pending" })

      // Save to local storage immediately
      saveLocalHighScore(walletAddress, score)
      
      // Update local state
      const currentUserHighScore = get().userHighScore
      const newHighScore = Math.max(currentUserHighScore, score)
      set({ userHighScore: newHighScore })

      // TODO: Implement actual blockchain transaction
      // const starknet = await connect({ modalMode: "neverAsk" })
      // if (!starknet) throw new Error("Wallet not available")
      // const contract = new Contract(CONTRACT_ABI, contractAddress, starknet.account)
      // const result = await contract.save_player_score(score, moves)
      // await provider.waitForTransaction(result.transaction_hash)

      // Mock successful transaction for build compatibility
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate network delay
      set({ transactionStatus: "accepted" })

      // Refresh user data
      const { refreshUserData } = get()
      await refreshUserData()

    } catch (error) {
      console.error("Failed to save score:", error)
      set({ transactionStatus: "failed" })
    } finally {
      set({ isLoading: false })

      // Clear transaction status after 5 seconds
      setTimeout(() => {
        set({ transactionStatus: null })
      }, 5000)
    }
  },

  markGameCompleted: async (finalScore: number, moves: number) => {
    const { isConnected, walletAddress } = get()
    if (!isConnected || !walletAddress) {
      throw new Error("Wallet not connected")
    }

    try {
      set({ isLoading: true, transactionStatus: "pending" })

      // Save to local storage immediately
      saveLocalHighScore(walletAddress, finalScore)
      
      // Update local state
      const currentUserHighScore = get().userHighScore
      const newHighScore = Math.max(currentUserHighScore, finalScore)
      set({ userHighScore: newHighScore })

      // TODO: Implement actual blockchain transaction
      // const starknet = await connect({ modalMode: "neverAsk" })
      // if (!starknet) throw new Error("Wallet not available")
      // const contract = new Contract(CONTRACT_ABI, contractAddress, starknet.account)
      // const result = await contract.mark_game_completed(finalScore, moves)
      // await provider.waitForTransaction(result.transaction_hash)

      // Mock successful transaction for build compatibility
      await new Promise(resolve => setTimeout(resolve, 2000))
      set({ transactionStatus: "accepted" })

      // Refresh user data
      const { refreshUserData } = get()
      await refreshUserData()

    } catch (error) {
      console.error("Failed to mark game completed:", error)
      set({ transactionStatus: "failed" })
    } finally {
      set({ isLoading: false })

      setTimeout(() => {
        set({ transactionStatus: null })
      }, 5000)
    }
  },

  fetchLeaderboard: async () => {
    try {
      const { contractAddress } = get()
      
      // TODO: Implement actual contract call
      // const contract = new Contract(CONTRACT_ABI, contractAddress, provider)
      // const result = await contract.get_leaderboard()
      
      // Mock leaderboard data for build compatibility
      const mockLeaderboard: LeaderboardEntry[] = [
        { player: "0x1234...5678", score: 50000, moves: 1200 },
        { player: "0x2345...6789", score: 35000, moves: 1500 },
        { player: "0x3456...789a", score: 28000, moves: 1800 },
        { player: "0x4567...89ab", score: 22000, moves: 2000 },
        { player: "0x5678...9abc", score: 18000, moves: 2200 },
      ]

      set({ leaderboard: mockLeaderboard })
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    }
  },

  fetchPlayerBestScore: async () => {
    const { isConnected, walletAddress } = get()
    if (!isConnected || !walletAddress) return

    try {
      // TODO: Implement actual contract call
      // const contract = new Contract(CONTRACT_ABI, contractAddress, provider)
      // const result = await contract.get_player_best_score(walletAddress)
      // set({ playerBestScore: Number(result) })

      // Use local storage as fallback
      const localScore = getLocalHighScore(walletAddress)
      set({ playerBestScore: localScore, userHighScore: localScore })
    } catch (error) {
      console.error("Failed to fetch player best score:", error)
      // Fallback to local storage
      const localScore = getLocalHighScore(get().walletAddress!)
      set({ playerBestScore: localScore, userHighScore: localScore })
    }
  },

  fetchPlayerStats: async () => {
    const { isConnected, walletAddress } = get()
    if (!isConnected || !walletAddress) return

    try {
      // TODO: Implement actual contract call
      // const contract = new Contract(CONTRACT_ABI, contractAddress, provider)
      // const result = await contract.get_player_stats(walletAddress)
      
      // Mock player stats for build compatibility
      const localScore = getLocalHighScore(walletAddress)
      const mockStats: PlayerStats = {
        current_score: 0,
        best_score: localScore,
        moves: 0,
        games_played: 5,
      }

      set({ playerStats: mockStats })
    } catch (error) {
      console.error("Failed to fetch player stats:", error)
    }
  },

  refreshUserData: async () => {
    const { fetchPlayerBestScore, fetchPlayerStats, fetchLeaderboard } = get()
    await Promise.all([
      fetchPlayerBestScore(),
      fetchPlayerStats(),
      fetchLeaderboard(),
    ])
  },
}))
