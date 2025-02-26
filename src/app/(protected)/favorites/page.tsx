// src/app/(protected)/favorites/page.tsx


'use client';

import { useState } from 'react';
import { ServiceCard } from '@/components/services/ServiceCard';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';

// Определяем тип для элементов favorites на основе структуры данных
interface FavoriteItem {
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

export default function FavoritesPage() {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const {
    favorites,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFavorites({ sortBy });

  // Если загрузка не завершена, показываем сообщение
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Загрузка избранного...</p>
        </div>
      </div>
    );
  }

  // Если нет избранных услуг, показываем сообщение
  if (!favorites || favorites.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">У вас пока нет избранных услуг</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="sticky top-14 bg-gray-50 z-10 p-2 grid grid-cols-2 gap-2">
        <Button
          variant={sortBy === 'newest' ? 'default' : 'outline'}
          className="w-full"
          onClick={() => setSortBy('newest')}
        >
          Более поздние
        </Button>
        <Button
          variant={sortBy === 'oldest' ? 'default' : 'outline'}
          className="w-full"
          onClick={() => setSortBy('oldest')}
        >
          Более ранние
        </Button>
      </div>

      <div className="p-2 space-y-4">
        {favorites.map((favorite: FavoriteItem) => (
          <ServiceCard
            key={favorite.id}
            id={favorite.id}
            title={favorite.title}
            price={favorite.price}
            duration={favorite.duration}
            master={favorite.master}
            category={favorite.category}
            location={favorite.location}
            stats={favorite.stats}
            image={favorite.image}
          />
        ))}

        {hasNextPage && (
          <div className="py-4 text-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
            >
              {isFetchingNextPage ? 'Загрузка...' : 'Показать ещё'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}