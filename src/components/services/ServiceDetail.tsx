// src/components/services/ServiceDetail.tsx - update

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, ChevronLeft, Heart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MasterInfo } from '@/components/services/MasterInfo'
import { ServicePriceDisplay } from '@/components/services/ServicePriceDisplay'
import { useAuthContext } from '@/providers/AuthProvider'

interface ServiceDetailProps {
  service: any  // тип нужно уточнить согласно схеме данных
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  const { user } = useAuthContext()
  const price = typeof service.price === 'string' ? 
    parseFloat(service.price) : 
    service.price

  return (
    <div className="max-w-md mx-auto px-4">
      <Link 
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 my-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="text-sm font-medium">Вернуться</span>
      </Link>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="relative aspect-square w-full">
          {service.image ? (
            <Image
              src={service.image}
              alt={service.name}
              fill
              className="rounded-t-lg object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 448px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-t-lg">
              <span className="text-gray-400">Нет изображения</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div>
            <h1 className="text-2xl font-bold">{service.name}</h1>
            <div className="mt-2 text-sm">
              {service.category.parent ? (
                <span>
                  <span className="text-gray-500">{service.category.parent.name}</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span className="text-blue-600">{service.category.name}</span>
                </span>
              ) : (
                <span className="text-blue-600">{service.category.name}</span>
              )}
            </div>
          </div>

          <MasterInfo master={service.master} />

          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{service.duration} мин</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              <span>
                {service.master.city.name}, {service.master.district.name}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <ServicePriceDisplay 
              serviceId={service.id}
              price={price}
              viewsCount={service.viewsCount}
              favoritesCount={service.favoritesCount}
            />
          </div>

          {service.description && (
            <div className="mt-6">
              <h2 className="font-medium">Описание</h2>
              <p className="mt-2 text-gray-600">{service.description}</p>
            </div>
          )}

          <div className="mt-6 space-y-6">
            <Link 
              href={user ? `/services/${service.id}/book` : '/login'}
              className="block"
            >
              <Button className="w-full">
                Записаться
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}