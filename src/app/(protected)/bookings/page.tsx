// src/app/(protected)/bookings/page.tsx


'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import dynamic from 'next/dynamic';
import type { BookingWithRelations } from '@/types/booking';

// Динамически импортируем ClientBookingsList с отключением SSR
const ClientBookingsList = dynamic(() => import('@/components/bookings/ClientBookingsList').then(mod => mod.ClientBookingsList), {
  ssr: false,
});

export default function BookingsPage() {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Мои записи</h1>
        <p className="text-muted-foreground mt-1">
          Управляйте своими записями к мастерам
        </p>
      </div>

      <ClientBookingsList />
    </div>
  );
}