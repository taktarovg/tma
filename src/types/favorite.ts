// src/types/favorite.ts - new
import { Service, User } from '@prisma/client'
import type { ServiceWithRelations } from './index'

export interface Favorite {
    id: number
    userId: number
    serviceId: number
    createdAt: Date
    service: ServiceWithRelations
}

export interface FavoriteFilters {
    sortBy: 'newest' | 'oldest'
}

export interface FavoritesResponse {
    favorites: Favorite[]
    hasMore: boolean
    nextCursor?: number
}