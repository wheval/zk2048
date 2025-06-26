"use client"

import { useCallback } from "react"
import { useStarknetStore } from "@/lib/starknet-store"
import { useToast } from "./use-toast"

export function useWallet() {
  const {
    isConnected,
    walletAddress,
    isLoading,
    connectWallet,
    disconnectWallet,
    playerBestScore,
    playerStats,
    fetchPlayerBestScore,
    fetchPlayerStats,
  } = useStarknetStore()

  const { toast } = useToast()

  const handleConnect = useCallback(async () => {
    try {
      await connectWallet()
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your Starknet wallet",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }, [connectWallet, toast])

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectWallet()
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect wallet properly",
        variant: "destructive",
      })
    }
  }, [disconnectWallet, toast])

  const formatAddress = useCallback((address: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  return {
    isConnected,
    walletAddress,
    isLoading,
    connectWallet: handleConnect,
    disconnectWallet: handleDisconnect,
    formatAddress,
    playerBestScore,
    playerStats,
    refreshPlayerData: useCallback(async () => {
      await Promise.all([fetchPlayerBestScore(), fetchPlayerStats()])
    }, [fetchPlayerBestScore, fetchPlayerStats]),
  }
} 