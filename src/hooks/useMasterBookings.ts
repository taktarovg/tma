// src/hooks/useMasterBookings.ts - new

'use client'

import { useQuery } from '@tanstack/react-query'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import type { BookingWithRelations } from '@/types/booking'

export function useMasterBookings(date: Date) {
  const start = format(startOfMonth(date), 'yyyy-MM-dd')
  const end = format(endOfMonth(date), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['masterBookings', start, end],
    queryFn: async () => {
      const response = await fetch(
        `/api/master/bookings?start=${start}&end=${end}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      return response.json() as Promise<BookingWithRelations[]>
    },
    // Кэшируем данные на 5 минут
    staleTime: 5 * 60 * 1000,
    // Держим неактивные данные в кэше 30 минут
    gcTime: 30 * 60 * 1000,
    // Автоматически обновляем данные при фокусе окна
    refetchOnWindowFocus: true
  })
}