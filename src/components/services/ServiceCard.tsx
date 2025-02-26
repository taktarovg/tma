// src/components/services/ServiceCard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock, MapPin, Crown, Eye, ArrowRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthContext } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  id: number;
  title: string;
  price: number;
  duration: string;
  master: {
    name: string;
    isPremium: boolean;
    avatar?: string | null;
  };
  category: {
    parent?: string | null;
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
  image?: string | null;
}

export const ServiceCard = React.memo(function ServiceCard(props: ServiceCardProps) {
  const { user } = useAuthContext();
  const { addToFavorites, removeFromFavorites, isFavorite, isAnimating } = useFavorites();
  const { id, title, price, duration, master, category, location, stats, image } = props;
  const [favoritesCount, setFavoritesCount] = useState(stats.favorites);

  const isFav = isFavorite(id);
  const isAnimatingHeart = isAnimating[id];

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      if (isFav) {
        await removeFromFavorites.mutateAsync(id);
        setFavoritesCount(prev => Math.max(0, prev - 1));
      } else {
        await addToFavorites.mutateAsync(id);
        setFavoritesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Ошибка при переключении в избранное:', error);
    }
  };

  return (
    <article className="bg-white rounded-lg overflow-hidden border shadow-sm">
      <div className="relative w-full aspect-square"> {/* Используем aspect-square для квадратных пропорций */}
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain" // Изменил на object-contain для сохранения пропорций
            priority={id <= 2}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Нет фото</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg">{title}</h3>
            <div className="text-sm">
              {category.parent && (
                <>
                  <span className="text-gray-500">{category.parent}</span>
                  <span className="text-gray-400 mx-1">•</span>
                </>
              )}
              <span className="text-blue-600">{category.name}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {location.city}, {location.district}
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-xl">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
              }).format(price)}
            </p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span>{duration}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar
                src={master.avatar ?? undefined}
                alt={master.name}
                fallback={master.name[0].toUpperCase()}
                className="w-8 h-8"
              />
              <span className="text-sm font-medium">
                {master.name}
                {master.isPremium && (
                  <Crown className="inline-block h-4 w-4 ml-1 text-yellow-400" />
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  "group relative flex items-center gap-1 transition-all duration-200",
                  isFav ? "text-red-500" : "text-gray-500 hover:text-gray-700",
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isFav && "fill-red-500 stroke-red-500",
                    isAnimatingHeart && "scale-125",
                    "group-hover:scale-110",
                  )}
                />
                <span className="text-sm text-gray-500">{favoritesCount}</span>
              </button>
              <div className="flex items-center text-sm text-gray-500 gap-1">
                <Eye className="h-4 w-4" />
                <span>{stats.views}</span>
              </div>
            </div>
          </div>
          <Link
            href={`/services/${id}`}
            className="p-2 -m-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Подробнее об услуге</span>
            <ArrowRight className="h-5 w-5 stroke-2" />
          </Link>
        </div>
      </div>
    </article>
  );
});

ServiceCard.displayName = 'ServiceCard';