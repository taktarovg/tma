// src/types/index.ts - update
import { Service, User, Category, City, District, MasterProfile, Booking, UserRole } from '@prisma/client'

export interface ServiceWithRelations extends Service {
    master: MasterProfile & {
        user: User
        city: City
        district: District
    }
    category: Category
}

export interface ServiceCardData {
    id: number
    title: string
    price: number
    duration: string
    category: string
    location: {
        city: string
        district: string
    }
    master: {
        name: string
        avatar?: string | null
        isPremium?: boolean
        rating?: {
            points: number
            categoryRank: number
        }
    }
    stats: {
        views: number
        favorites: number
    }
}

export interface BookingWithRelations extends Booking {
    service: ServiceWithRelations
    user: User
}

export interface MasterProfileWithRelations extends MasterProfile {
    user: User
    city: City
    district: District
    services: ServiceWithRelations[]
}

export type { UserRole }

export interface Session {
    user: {
        id: number // изменено с string на number
        telegramId: string
        username: string | null
        firstName: string | null
        lastName: string | null
        role: UserRole
    }
}

export interface AuthResponse {
    user: Session['user']
    error?: string
}

export interface FilterOption {
    id: string
    name: string
    cityId?: string
}