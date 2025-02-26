// src/components/ui/Tooltip.tsx - new
'use client'

import * as React from "react"

interface TooltipProps {
  text: string
  children: React.ReactNode
}

export function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 w-64 p-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg -translate-x-1/2 left-1/2 bottom-full mb-2">
          {text}
          <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  )
}