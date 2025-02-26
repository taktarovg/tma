// src/components/services/ServiceList.tsx - update
'use client'

import React, { useMemo } from 'react'
import { ServiceCard } from './ServiceCard'
import { City, District, Category } from '@prisma/client'

interface ServiceData {
  id: number
  title: string
  price: number
  duration: string
  master: {
    name: string
    isPremium: boolean
    avatar: string | null
  }
  category: {
    parent?: string | null
    name: string
  }
  location: {
    city: string
    district: string
  }
  stats: {
    views: number
    favorites: number
  }
  image: string | null
}

interface ServiceListProps {
  services: ServiceData[]
}

export const ServiceList = React.memo(function ServiceList({ services }: ServiceListProps) {
  if (!services || services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-lg text-gray-500 text-center">
          По вашему запросу услуг не найдено
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 text-blue-500 hover:text-blue-600 text-sm"
        >
          Сбросить фильтры
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          {...service}
        />
      ))}
    </div>
  )
})

ServiceList.displayName = 'ServiceList'