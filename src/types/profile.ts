// src/types/profile.ts - new
import { User, Service, City, District } from '@prisma/client'

export interface UserProfile extends User {
    city?: City | null
    district?: District | null
    masterProfile?: MasterProfile | null
}

export interface MasterProfile {
    id: string
    userId: string
    cityId: string
    districtId: string
    bio?: string | null
    services?: Service[]
    rating?: number
    isPremium: boolean
}

export interface ProfileFormData {
    firstName: string
    lastName: string
    cityId?: string
    districtId?: string
    avatar?: string | null
}

export interface LocationData {
    cities: Array<{
        id: string
        name: string
    }>
    districts: Array<{
        id: string
        name: string
        cityId: string
    }>
}