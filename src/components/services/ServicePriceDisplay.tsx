// src/components/services/ServicePriceDisplay.tsx - update
'use client'

import { useState } from 'react'
import { Heart, Eye } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuthContext } from '@/providers/AuthProvider'
import { cn } from '@/lib/utils'

interface ServicePriceDisplayProps {
  serviceId: number
  price: number
  viewsCount: number
  favoritesCount: number
}

export function ServicePriceDisplay({ 
  serviceId, 
  price, 
  viewsCount, 
  favoritesCount: initialFavoritesCount 
}: ServicePriceDisplayProps) {
  const { user } = useAuthContext()
  const { 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite, 
    isAnimating 
  } = useFavorites()

  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount)
  const isFav = isFavorite(serviceId)
  const isAnimatingHeart = isAnimating[serviceId]

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!user) {
      window.location.href = '/login'
      return
    }
    
    try {
      if (isFav) {
        await removeFromFavorites.mutateAsync(serviceId)
        setFavoritesCount(prev => Math.max(0, prev - 1))
      } else {
        await addToFavorites.mutateAsync(serviceId)
        setFavoritesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">
        {new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(price)}
      </h2>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleFavoriteClick}
          className={cn(
            "group relative flex items-center gap-1 transition-all duration-200",
            isFav ? "text-red-500" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-all duration-200",
              isFav && "fill-red-500 stroke-red-500",
              isAnimatingHeart && "scale-125",
              "group-hover:scale-110"
            )}
          />
          <span className="text-sm text-gray-500">{favoritesCount}</span>
        </button>
        <div className="flex items-center text-gray-500">
          <Eye className="h-4 w-4 mr-1" />
          <span className="text-sm">{viewsCount}</span>
        </div>
      </div>
    </div>
  )
}