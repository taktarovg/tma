// src/components/bookings/BookingList.tsx
'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Booking } from '@prisma/client'

interface BookingListProps {
  bookings: Array<Booking & {
    service: {
      name: string
      price: number
      master: {
        user: {
          firstName: string
          lastName: string
        }
        city: {
          name: string
        }
        district: {
          name: string
        }
      }
    }
  }>
}

export function BookingList({ bookings }: BookingListProps) {
  const handleCancel = async (id: number) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELED' }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }

      // Обновляем UI
      window.location.reload()
    } catch (error) {
      console.error('Cancel booking error:', error)
    }
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="rounded-lg border bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{booking.service.name}</h3>
              <p className="text-sm text-gray-500">
                {booking.service.master.user.firstName}{' '}
                {booking.service.master.user.lastName}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{booking.service.price} ₽</p>
              <p className="text-sm text-gray-500">
                {format(new Date(booking.bookingDateTime), 'PPp', { locale: ru })}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>2 часа</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                <span>
                  {booking.service.master.city.name},{' '}
                  {booking.service.master.district.name}
                </span>
              </div>
            </div>

            {booking.status === 'PENDING' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancel(booking.id)}
              >
                Отменить
              </Button>
            )}
          </div>

          <div className="mt-2">
            {booking.status === 'PENDING' && (
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                Ожидает подтверждения
              </span>
            )}
            {booking.status === 'CONFIRMED' && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                Подтверждено
              </span>
            )}
            {booking.status === 'CANCELED' && (
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                Отменено
              </span>
            )}
            {booking.status === 'COMPLETED' && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                Завершено
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}