"use client"

import { useStarknetStore } from "@/lib/starknet-store"

export function useSaveScore() {
  const { 
    isLoading, 
    transactionStatus, 
    saveScore: saveScoreToStore, 
    isConnected 
  } = useStarknetStore()

  const saveScore = async (score: number, moves: number) => {
    await saveScoreToStore(score, moves)
  }

  const getTransactionMessage = () => {
    switch (transactionStatus) {
      case "pending":
        return {
          title: "Saving to Starknet",
          description: "Your score is being saved to the blockchain...",
        }
      case "accepted":
        return {
          title: "Score Saved!",
          description: "Your score has been successfully saved to Starknet.",
        }
      case "failed":
        return {
          title: "Save Failed",
          description: "Failed to save your score. Please try again.",
          variant: "destructive" as const,
        }
      default:
        return null
    }
  }

  const canSave = isConnected && !isLoading

  return {
    saveScore,
    isLoading,
    transactionStatus,
    getTransactionMessage,
    canSave,
  }
} 