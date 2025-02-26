// src/app/(protected)/master/bookings/page.tsx


'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MasterBookingsManager } from '@/components/bookings/MasterBookingsManager';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/providers/AuthProvider';
import type { BookingWithRelations } from '@/types/booking';

export default function MasterBookingsPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'MASTER') {
      router.push('/');
      return;
    }
  }, [user, router]);

  if (!user || user.role !== 'MASTER') {
    return null; // Рендеринг прекращается, если перенаправление еще не произошло
  }

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Управление записями</h1>
        <p className="text-muted-foreground mt-1">
          Просматривайте и управляйте записями клиентов
        </p>
      </div>

      <MasterBookingsManager />
    </div>
  );
}