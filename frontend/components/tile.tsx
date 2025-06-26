"use client"

import { motion } from "framer-motion"

interface TileProps {
  value: number
  position: { row: number; col: number }
}

export function Tile({ value, position }: TileProps) {
  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 border-blue-200/50",
      4: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-900 border-emerald-200/50",
      8: "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-900 border-amber-200/50",
      16: "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-900 border-orange-300/50",
      32: "bg-gradient-to-br from-red-100 to-red-200 text-red-900 border-red-300/50",
      64: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-900 border-purple-300/50",
      128: "bg-gradient-to-br from-pink-200 to-pink-300 text-pink-900 border-pink-400/50 text-lg font-semibold",
      256: "bg-gradient-to-br from-indigo-200 to-indigo-300 text-indigo-900 border-indigo-400/50 text-lg font-semibold",
      512: "bg-gradient-to-br from-teal-200 to-teal-300 text-teal-900 border-teal-400/50 text-lg font-semibold",
      1024: "bg-gradient-to-br from-cyan-300 to-cyan-400 text-cyan-900 border-cyan-500/50 text-sm font-bold",
      2048: "bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 text-white border-purple-300/50 text-sm font-bold shadow-xl animate-pulse",
    }
    return colors[value] || "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200/50 text-sm"
  }

  if (value === 0) {
    return <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/40 rounded-xl flex items-center justify-center border border-white/50"></div>
  }

  return (
    <motion.div
      layout
      transition={{ 
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.25
      }}
      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center font-bold border shadow-md ${getTileColor(value)}`}
    >
      {value}
    </motion.div>
  )
}
