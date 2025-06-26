"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Tile } from "./tile"

interface GameBoardProps {
  board: number[][]
  onMove: {
    up: () => void
    down: () => void
    left: () => void
    right: () => void
  }
  disabled: boolean
}

export function GameBoard({ board, onMove, disabled }: GameBoardProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    const minSwipeDistance = 50

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          onMove.right()
        } else {
          onMove.left()
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          onMove.down()
        } else {
          onMove.up()
        }
      }
    }

    setTouchStart(null)
  }

  return (
    <div
      className="bg-gradient-to-br from-indigo-200 to-purple-200 rounded-2xl shadow-xl select-none p-4 w-fit mx-auto border border-indigo-300/30"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div 
        className="grid grid-cols-4 gap-2 place-items-center"
        layout
      >
        {board.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <Tile key={`${rowIndex}-${colIndex}`} value={value} position={{ row: rowIndex, col: colIndex }} />
          )),
        )}
      </motion.div>
    </div>
  )
}
