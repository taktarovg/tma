// src/components/ui/Avatar.tsx - update
'use client'  // Добавляем директиву use client

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: "sm" | "md" | "lg"
  fallback?: string
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
}

export function Avatar({
  size = "md",
  className,
  src,
  alt,
  fallback,
  ...props
}: AvatarProps) {
  const [error, setError] = React.useState(false)

  if (!src || error) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center rounded-full bg-gray-100 text-gray-500",
          sizeClasses[size],
          className
        )}
      >
        <span className={cn(
          "font-medium",
          size === "lg" ? "text-xl" : "text-sm"
        )}>
          {fallback || '?'}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn(
        "rounded-full object-cover",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}