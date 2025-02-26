// src/app/(protected)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import dynamic from 'next/dynamic';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@prisma/client';

// Динамически импортируем UserProfileCard с отключением SSR
const UserProfileCard = dynamic(() => import('@/components/profile/UserProfileCard').then(mod => mod.UserProfileCard), {
  ssr: false,
  loading: () => <ProfileSkeleton />
});

// Компонент-скелетон для загрузки
function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col items-center mb-6">
        <Skeleton className="w-20 h-20 rounded-full mb-4" />
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState<User | null>(null);

  // Добавляем логирование для отладки
  useEffect(() => {
    console.log('ProfilePage - Mounted, user:', user, 'isLoading:', isLoading);
  }, []);

  // Загружаем актуальные данные профиля с сервера
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        console.log('Fetching profile data for user:', user.id);
        setIsProfileLoading(true);
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        console.log('Profile data loaded:', data);
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные профиля',
          variant: 'destructive',
        });
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    if (user) {
      fetchProfileData();
    }
  }, [user, toast]);

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('No user in ProfilePage, redirecting to /')
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Состояния загрузки
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return null; // Перенаправление уже должно происходить через useEffect
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      {isProfileLoading ? (
        <ProfileSkeleton />
      ) : (
        <UserProfileCard user={profileData || user} />
      )}
    </div>
  );
}