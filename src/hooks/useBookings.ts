// src/hooks/useBookings.ts

'use client'

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import type { BookingWithRelations, BookingStatus } from '@/types/booking';

interface UseBookingsOptions {
  filter?: 'all' | 'upcoming' | 'past';
  masterId?: number;
  date?: string;
  onSuccessUpdate?: () => void;
}

export function useBookings(options: UseBookingsOptions = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Запрос списка записей
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['bookings', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.filter) params.set('filter', options.filter);
      if (options.masterId) params.set('masterId', options.masterId.toString());
      if (options.date) params.set('date', options.date);

      const response = await fetch(`/api/bookings?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });

  // Мутация для создания записи
  const createBooking = useMutation({
    mutationFn: async (data: {
      serviceId: number;
      date: string;
      time: string;
      notes?: string;
    }) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: 'Успешно',
        description: 'Запись создана',
      });
      options.onSuccessUpdate?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать запись',
        variant: 'destructive',
      });
    },
  });

  // Мутация для обновления статуса
  const updateBookingStatus = useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: number;
      status: BookingStatus;
    }) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update booking');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: 'Успешно',
        description: 'Статус записи обновлён',
      });
      options.onSuccessUpdate?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить статус',
        variant: 'destructive',
      });
    },
  });

  // Мутация для отмены записи
  const cancelBooking = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELED' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel booking');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: 'Успешно',
        description: 'Запись отменена',
      });
      options.onSuccessUpdate?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отменить запись',
        variant: 'destructive',
      });
    },
  });

  return {
    bookings,
    isLoading: isLoading || isLoadingBookings,
    createBooking: createBooking.mutateAsync,
    updateBookingStatus: updateBookingStatus.mutateAsync,
    cancelBooking: cancelBooking.mutateAsync,
    isCreating: createBooking.isPending,     // Замена isLoading на isPending
    isUpdating: updateBookingStatus.isPending, // Замена isLoading на isPending
    isCanceling: cancelBooking.isPending,     // Замена isLoading на isPending
  };
}