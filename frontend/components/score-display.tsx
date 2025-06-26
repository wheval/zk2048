"use client"

interface ScoreDisplayProps {
  score: number
  bestScore: number
}

export function ScoreDisplay({ score, bestScore }: ScoreDisplayProps) {
  return (
    <div className="flex w-full gap-4 justify-center">
      <div className="bg-white rounded-xl p-6 text-center shadow-lg flex-1">
        <div className="text-gray-500 text-sm font-medium mb-1">SCORE</div>
        <div className="text-3xl font-bold text-indigo-600">{score}</div>
      </div>
      <div className="bg-white rounded-xl p-6 text-center shadow-lg flex-1">
        <div className="text-gray-500 text-sm font-medium mb-1">BEST</div>
        <div className="text-3xl font-bold text-indigo-600">{bestScore}</div>
      </div>
    </div>
  )
}
