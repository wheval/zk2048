"use client"

import { motion } from "framer-motion"

interface TileProps {
  value: number
  position: { row: number; col: number }
}

export function Tile({ value, position }: TileProps) {
  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: "bg-blue-100 text-blue-800 border-blue-200",
      4: "bg-green-100 text-green-800 border-green-200",
      8: "bg-yellow-100 text-yellow-800 border-yellow-200",
      16: "bg-orange-100 text-orange-800 border-orange-200",
      32: "bg-red-100 text-red-800 border-red-200",
      64: "bg-purple-100 text-purple-800 border-purple-200",
      128: "bg-pink-100 text-pink-800 border-pink-200 text-lg",
      256: "bg-indigo-100 text-indigo-800 border-indigo-200 text-lg",
      512: "bg-teal-100 text-teal-800 border-teal-200 text-lg",
      1024: "bg-cyan-100 text-cyan-800 border-cyan-200 text-sm",
      2048: "bg-gradient-to-r from-purple-400 to-pink-400 text-white border-purple-300 text-sm font-bold shadow-lg",
    }
    return colors[value] || "bg-gray-100 text-gray-800 border-gray-200 text-sm"
  }

  if (value === 0) {
    return <div className="w-16 h-16 bg-white/30 rounded-lg flex items-center justify-center"></div>
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.15 }}
      className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold border-2 shadow-sm ${getTileColor(value)}`}
    >
      {value}
    </motion.div>
  )
}
