// src/components/profile/UserProfileCard.tsx
'use client';

'use client';

import { User, City, District, MasterProfile, Service } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/Avatar';
import { useRouter } from 'next/navigation'; // Добавляем для навигации

interface UserProfileCardProps {
  user: User & {
    city?: City | null;
    district?: District | null;
    masterProfile?: (MasterProfile & {
      services?: Service[];
    }) | null;
  };
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const router = useRouter(); // Инициализируем роутер для навигации
  const location = [
    user.city?.name,
    user.district?.name,
  ].filter(Boolean).join(', ');

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        {/* Заголовок для мастера */}
        {user.role === 'MASTER' && (
          <div className="text-center mb-4">
            <h2 className="text-lg font-medium text-blue-600">Бьюти Мастер</h2>
          </div>
        )}

        {/* Основная информация о пользователе */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar
                src={user.avatar || undefined}
                fallback={(user.firstName?.[0] || user.username?.[0] || '?').toUpperCase()}
                size="lg"
                className="w-20 h-20 relative"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">
                {user.firstName} {user.lastName}
              </h1>
              {user.username && (
                <p className="text-gray-500">@{user.username}</p>
              )}
              {location && (
                <p className="text-gray-600 mt-1">{location}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.push('/profile/edit')}>
            <Edit className="h-5 w-5" />
          </Button>
        </div>

        {/* Секция для мастера */}
        {user.role === 'MASTER' && user.masterProfile && (
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Мои услуги</h2>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
                onClick={() => router.push('/services/create')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Добавить услугу
              </Button>
            </div>

            {/* Список услуг */}
            <div className="space-y-4">
              {user.masterProfile.services?.length ? (
                user.masterProfile.services.map((service) => (
                  <div key={service.id} className="flex items-start gap-4 border rounded-lg p-4">
                    {/* Аватар услуги */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                      {service.image ? (
                        <Image
                          src={service.image}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Нет фото</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Информация об услуге */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm font-medium">{service.price.toString()} ₽</span>
                            <span className="text-sm text-gray-500">{service.duration} мин</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/services/${service.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  У вас пока нет добавленных услуг
                </p>
              )}
            </div>
          </div>
        )}

        {/* Секция "Стать мастером" для обычных пользователей */}
        {user.role === 'USER' && (
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-2xl font-bold">Стать мастером</h2>
            <p className="text-gray-600 mt-2 mb-6">
              Создайте свою первую услугу и станьте мастером
            </p>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => router.push('/services/create')}
            >
              Создать услугу
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}