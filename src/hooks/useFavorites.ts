// src/hooks/useFavorites.ts
'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

// Интерфейс для объекта избранного
interface Favorite {
  id: number;
  title: string;
  price: number;
  duration: string;
  master: {
    name: string;
    isPremium: boolean;
    avatar: string | null;
  };
  category: {
    parent: string | null;
    name: string;
  };
  location: {
    city: string;
    district: string;
  };
  stats: {
    views: number;
    favorites: number;
  };
  image: string | null;
}

// Интерфейс для ответа API
interface FavoritesResponse {
  favorites: Favorite[];
  nextCursor?: string | null;
}

export function useFavorites(filters?: { sortBy?: 'newest' | 'oldest' }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState<Record<string, boolean>>({});

  // Запрос списка избранного с типизацией
  const { data, isLoading, refetch } = useQuery<FavoritesResponse>({
    queryKey: ['favorites', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters?.sortBy) {
        searchParams.set('sortBy', filters.sortBy);
      }

      const response = await fetch(`/api/favorites?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      return response.json();
    },
  });

  // Мутация для добавления в избранное
  const addToFavorites = useMutation({
    mutationFn: async (serviceId: number) => {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to favorites');
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (_, serviceId) => {
      setIsAnimating((prev) => ({ ...prev, [serviceId]: true }));
      setTimeout(() => {
        setIsAnimating((prev) => ({ ...prev, [serviceId]: false }));
      }, 300);

      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: 'Успешно',
        description: 'Добавлено в избранное',
      });
    },
    onError: (error: Error) => {
      console.error('Add to favorites error:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось добавить в избранное',
        variant: 'destructive',
      });
    },
  });

  // Мутация для удаления из избранного
  const removeFromFavorites = useMutation({
    mutationFn: async (serviceId: number) => {
      const response = await fetch(`/api/favorites/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from favorites');
      }
    },
    onSuccess: (_, serviceId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: 'Успешно',
        description: 'Удалено из избранного',
      });
    },
    onError: (error: Error) => {
      console.error('Remove from favorites error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить из избранного',
        variant: 'destructive',
      });
    },
  });

  // Функция для проверки, находится ли услуга в избранном
  const isFavorite = useCallback((serviceId: number): boolean => {
    return data?.favorites?.some((fav: Favorite) => fav.id === serviceId) ?? false;
  }, [data?.favorites]);

  return {
    favorites: data?.favorites || [],
    hasNextPage: !!data?.nextCursor,
    isLoading,
    isFetchingNextPage: false,
    fetchNextPage: refetch,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    isAnimating,
  };
}