// src/app/(protected)/profile/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import dynamic from 'next/dynamic';
import type { User } from '@prisma/client';

// Динамически импортируем UserProfileCard с отключением SSR
const UserProfileCard = dynamic(() => import('@/components/profile/UserProfileCard').then(mod => mod.UserProfileCard), {
  ssr: false,
});

export default function ProfilePage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return null; // Перенаправление уже произошло
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <UserProfileCard user={user} />
    </div>
  );
}