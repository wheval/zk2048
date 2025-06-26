"use client"

import { create } from "zustand"
import { connect, disconnect } from '@starknet-io/get-starknet'
import { 
  Contract, 
  RpcProvider, 
  constants, 
  CallData, 
  cairo,
  shortString,
  WalletAccount
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
  totalGamesPlayed: number // Add total games played
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  saveScore: (score: number, moves: number) => Promise<void>
  markGameCompleted: (finalScore: number, moves: number) => Promise<void>
  fetchLeaderboard: () => Promise<void>
  fetchPlayerBestScore: () => Promise<void>
  fetchPlayerStats: () => Promise<void>
  fetchTotalGamesPlayed: () => Promise<void> // Add new function
  refreshUserData: () => Promise<void>
}

// Contract configuration - Update with your deployed contract address
const CONTRACT_ADDRESS = "0x0489559e3ad7ea6591efb79e0f4a3ff4c7485c8895fce10ebb45fad339fc519d"
const CONTRACT_ABI = [
  {
    "type": "impl",
    "name": "ZK2048GameImpl",
    "interface_name": "contract::IZK2048Game"
  },
  {
    "type": "interface",
    "name": "contract::IZK2048Game",
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
        "name": "reset_leaderboard",
        "inputs": [],
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
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": []
  },
  {
    "type": "event",
    "name": "contract::ZK2048Game::NewHighScore",
    "kind": "struct",
    "members": [
      {
        "name": "player",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "old_score",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "new_score",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "moves",
        "type": "core::integer::u32",
        "kind": "data"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::ZK2048Game::GameCompleted",
    "kind": "struct",
    "members": [
      {
        "name": "player",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "final_score",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "moves",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "is_best_score",
        "type": "core::bool",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::ZK2048Game::LeaderboardUpdated",
    "kind": "struct",
    "members": [
      {
        "name": "player",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "score",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "position",
        "type": "core::integer::u8",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::ZK2048Game::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "NewHighScore",
        "type": "contract::ZK2048Game::NewHighScore",
        "kind": "nested"
      },
      {
        "name": "GameCompleted",
        "type": "contract::ZK2048Game::GameCompleted",
        "kind": "nested"
      },
      {
        "name": "LeaderboardUpdated",
        "type": "contract::ZK2048Game::LeaderboardUpdated",
        "kind": "nested"
      }
    ]
  }
]

// Initialize RPC provider
const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_7", // Sepolia testnet
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
  totalGamesPlayed: 0,

  connectWallet: async () => {
    try {
      set({ isLoading: true })

      // Connect to Starknet wallet using get-starknet
      const starknet = await connect() as any
      console.log("Starknet object:", starknet)

      if (!starknet) {
        throw new Error("No wallet found or user cancelled connection")
      }

      // Enable the wallet to get access to account
      try {
        await starknet.enable()
        console.log("Wallet enabled successfully")
      } catch (enableError) {
        console.log("Enable error:", enableError)
        // Some wallets might not need explicit enable
      }

      // Get account info - try multiple properties
      let walletAddress = null
      
      // Try different ways to get the address
      if (starknet.selectedAddress) {
        walletAddress = starknet.selectedAddress
        console.log("Got address from selectedAddress:", walletAddress)
      } else if (starknet.account?.address) {
        walletAddress = starknet.account.address
        console.log("Got address from account.address:", walletAddress)
      } else if (starknet.address) {
        walletAddress = starknet.address
        console.log("Got address from address:", walletAddress)
      }
      
      if (!walletAddress) {
        console.log("Available properties:", Object.keys(starknet))
        throw new Error("Wallet connection failed - no account found")
      }

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

      console.log(`Wallet connected: ${walletAddress}`)
      
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      set({
        isConnected: false,
        walletAddress: null,
        isLoading: false,
        userHighScore: 0,
      })
      
      // Re-throw error for UI feedback
      throw error
    }
  },

  disconnectWallet: async () => {
    try {
      await disconnect({ clearLastWallet: true })
      set({
        isConnected: false,
        walletAddress: null,
        transactionStatus: null,
        playerBestScore: 0,
        playerStats: null,
        userHighScore: 0,
        totalGamesPlayed: 0,
      })
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
      // Even if disconnect fails, clear the local state
      set({
        isConnected: false,
        walletAddress: null,
        transactionStatus: null,
        playerBestScore: 0,
        playerStats: null,
        userHighScore: 0,
        totalGamesPlayed: 0,
      })
    }
  },

  saveScore: async (score: number, moves: number) => {
    const { isConnected, walletAddress } = get()
    if (!isConnected || !walletAddress) {
      throw new Error("Wallet not connected")
    }

    console.log(`Attempting to save score: ${score}, moves: ${moves}`)

    try {
      set({ isLoading: true, transactionStatus: "pending" })

      // Save to local storage immediately as fallback
      saveLocalHighScore(walletAddress, score)
      
      // Update local state
      const currentUserHighScore = get().userHighScore
      const newHighScore = Math.max(currentUserHighScore, score)
      set({ userHighScore: newHighScore })

      // Execute actual blockchain transaction
      console.log("Connecting to wallet for transaction...")
      const starknet = await connect() as any
      
      if (!starknet) {
        throw new Error("Failed to connect to wallet")
      }

      // Ensure we have access to the account
      if (!starknet.account) {
        console.log("Enabling wallet...")
        await starknet.enable()
        if (!starknet.account) {
          throw new Error("Wallet account not available after enabling")
        }
      }

      console.log("Creating contract instance...")
      const contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, starknet.account as WalletAccount)
      
      console.log("Calling save_player_score contract function...")
      const result = await contract.save_player_score(score, moves)
      
      console.log("Transaction submitted:", result.transaction_hash)
      
      // Wait for transaction confirmation
      console.log("Waiting for transaction confirmation...")
      await provider.waitForTransaction(result.transaction_hash)
      
      console.log("Transaction confirmed successfully!")
      set({ transactionStatus: "accepted" })

      // Refresh user data after successful transaction
      const { refreshUserData } = get()
      await refreshUserData()

    } catch (error) {
      console.error("Failed to save score:", error)
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        walletAddress,
        score,
        moves
      })
      set({ transactionStatus: "failed" })
      
      // Re-throw error for UI feedback
      throw error
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

    console.log(`Attempting to mark game completed: ${finalScore}, moves: ${moves}`)

    try {
      set({ isLoading: true, transactionStatus: "pending" })

      // Save to local storage immediately as fallback
      saveLocalHighScore(walletAddress, finalScore)
      
      // Update local state
      const currentUserHighScore = get().userHighScore
      const newHighScore = Math.max(currentUserHighScore, finalScore)
      set({ userHighScore: newHighScore })

      // Execute actual blockchain transaction
      console.log("Connecting to wallet for game completion transaction...")
      const starknet = await connect() as any
      
      if (!starknet) {
        throw new Error("Failed to connect to wallet")
      }

      // Ensure we have access to the account
      if (!starknet.account) {
        console.log("Enabling wallet...")
        await starknet.enable()
        if (!starknet.account) {
          throw new Error("Wallet account not available after enabling")
        }
      }

      console.log("Creating contract instance...")
      const contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, starknet.account as WalletAccount)
      
      console.log("Calling mark_game_completed contract function...")
      const result = await contract.mark_game_completed(finalScore, moves)
      
      console.log("Game completion transaction submitted:", result.transaction_hash)
      
      // Wait for transaction confirmation
      console.log("Waiting for transaction confirmation...")
      await provider.waitForTransaction(result.transaction_hash)
      
      console.log("Game completion transaction confirmed successfully!")
      set({ transactionStatus: "accepted" })

      // Refresh user data after successful transaction
      const { refreshUserData } = get()
      await refreshUserData()

    } catch (error) {
      console.error("Failed to mark game completed:", error)
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        walletAddress,
        finalScore,
        moves
      })
      set({ transactionStatus: "failed" })
      
      // Re-throw error for UI feedback
      throw error
    } finally {
      set({ isLoading: false })

      setTimeout(() => {
        set({ transactionStatus: null })
      }, 5000)
    }
  },

  fetchLeaderboard: async () => {
    try {
      // Fetch actual leaderboard from contract
      const contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, provider)
      const result = await contract.get_leaderboard()
      
      // Convert contract result to leaderboard format
      const leaderboard: LeaderboardEntry[] = result.map((entry: any) => ({
        player: entry[0], // ContractAddress
        score: Number(entry[1]), // u32 score
        moves: 0, // Contract doesn't store moves in leaderboard, could enhance later
      }))

      set({ leaderboard })
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
      
      // Fallback to empty leaderboard on error
      set({ leaderboard: [] })
    }
  },

  fetchPlayerBestScore: async () => {
    const { isConnected, walletAddress } = get()
    if (!isConnected || !walletAddress) return

    try {
      // Fetch actual player best score from contract
      const contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, provider)
      const result = await contract.get_player_best_score(walletAddress)
      const onChainScore = Number(result)
      
      // Use the higher of on-chain score or local score
      const localScore = getLocalHighScore(walletAddress)
      const bestScore = Math.max(onChainScore, localScore)
      
      set({ playerBestScore: bestScore, userHighScore: bestScore })
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
      // Fetch actual player stats from contract
      const contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, provider)
      const result = await contract.get_player_stats(walletAddress)
      
      // Contract returns (current_score, best_score, moves) as tuple - NOT games_played
      const playerStats: PlayerStats = {
        current_score: Number(result[0]),
        best_score: Number(result[1]),
        moves: Number(result[2]),
        games_played: 0, // Will be updated by fetchTotalGamesPlayed
      }

      set({ playerStats })
    } catch (error) {
      console.error("Failed to fetch player stats:", error)
      
      // Fallback to local storage
      const localScore = getLocalHighScore(get().walletAddress!)
      const fallbackStats: PlayerStats = {
        current_score: 0,
        best_score: localScore,
        moves: 0,
        games_played: 0,
      }
      set({ playerStats: fallbackStats })
    }
  },

  fetchTotalGamesPlayed: async () => {
    try {
      // Fetch total games played from contract (global stat, not player-specific)
      const contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, provider)
      const result = await contract.get_total_games_played()
      const totalGames = Number(result)
      
      set({ totalGamesPlayed: totalGames })
    } catch (error) {
      console.error("Failed to fetch total games played:", error)
      // Fallback to 0
      set({ totalGamesPlayed: 0 })
    }
  },

  refreshUserData: async () => {
    const { fetchPlayerBestScore, fetchPlayerStats, fetchLeaderboard, fetchTotalGamesPlayed } = get()
    await Promise.all([
      fetchPlayerBestScore(),
      fetchPlayerStats(),
      fetchLeaderboard(),
      fetchTotalGamesPlayed(),
    ])
  },
}))
