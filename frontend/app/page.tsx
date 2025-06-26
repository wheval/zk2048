"use client"

import { Game } from "@/components/game"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 p-4">
      <div className="max-w-sm mx-auto">
        <Game />
      </div>
    </div>
  )
}
