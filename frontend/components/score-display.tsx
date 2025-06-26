"use client"

interface ScoreDisplayProps {
  score: number
  bestScore: number
}

export function ScoreDisplay({ score, bestScore }: ScoreDisplayProps) {
  return (
    <div className="flex gap-4 justify-center max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-white/50 flex-1 min-w-0">
        <div className="text-gray-500 text-xs font-semibold mb-2 tracking-wider">SCORE</div>
        <div className="text-2xl sm:text-3xl font-bold text-indigo-600 tabular-nums">{score.toLocaleString()}</div>
      </div>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-white/50 flex-1 min-w-0">
        <div className="text-gray-500 text-xs font-semibold mb-2 tracking-wider">BEST</div>
        <div className="text-2xl sm:text-3xl font-bold text-indigo-600 tabular-nums">{bestScore.toLocaleString()}</div>
      </div>
    </div>
  )
}
