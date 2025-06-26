"use client"

import { Button } from "@/components/ui/button"
import { Wallet, WifiOff } from "lucide-react"
import { useStarknetStore } from "@/lib/starknet-store"

export function WalletStatus() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useStarknetStore()

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? <Wallet className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-gray-400" />}
          <span className="font-medium">{isConnected ? "Wallet Connected" : "Wallet Disconnected"}</span>
        </div>
        <Button
          onClick={isConnected ? disconnectWallet : connectWallet}
          variant={isConnected ? "outline" : "default"}
          size="sm"
        >
          {isConnected ? "Disconnect" : "Connect"}
        </Button>
      </div>
      {isConnected && walletAddress && (
        <div className="mt-2 text-sm text-gray-600">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      )}
    </div>
  )
}
