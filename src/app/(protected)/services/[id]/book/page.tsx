// src/app/(protected)/services/[id]/book/page.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { CreateBookingForm } from '@/components/bookings/CreateBookingForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

interface BookingPageProps {
  params: {
    id: string;
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const cookieStore = cookies();
  const token = cookieStore.get('sessionToken')?.value;
  const request = {
    headers: new Headers({
      'Authorization': token ? `Bearer ${token}` : '',
    }),
  } as NextRequest;

  const session = await getSession(request);
  if (!session?.user) {
    redirect('/login');
  }

  const service = await prisma.service.findUnique({
    where: { 
      id: parseInt(params.id),
    },
    include: {
      master: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          city: true,
          district: true,
          settings: true,
          daySchedules: {
            where: {
              date: {
                gte: startOfDay(new Date()),
                lte: endOfDay(addDays(new Date(), 30)),
              },
            },
            orderBy: {
              date: 'asc',
            },
          },
        },
      },
    },
  });

  if (!service) {
    redirect('/services');
  }

  // Получаем существующие записи для проверки доступности времени (оставлено для возможного использования)
  const existingBookings = await prisma.booking.findMany({
    where: {
      AND: [
        { masterId: service.master.id },
        { status: { in: ['PENDING', 'CONFIRMED'] } },
        {
          bookingDateTime: {
            gte: startOfDay(new Date()),
          },
        },
      ],
    },
    select: {
      bookingDateTime: true,
      service: {
        select: {
          duration: true,
        },
      },
    },
  });

  // Преобразуем записи в формат (оставлено для возможного использования)
  const bookingTimes = existingBookings.map((booking) => ({
    startTime: new Date(booking.bookingDateTime),
    endTime: new Date(
      new Date(booking.bookingDateTime).getTime() + 
      (booking.service.duration + (service.master.settings?.bufferTime || 15)) * 60000
    ),
  }));

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Link
        href={`/services/${service.id}`}
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Вернуться к услуге
      </Link>

      <h1 className="text-2xl font-bold mb-6">Запись на услугу</h1>

      <CreateBookingForm service={service} />
    </div>
  );
}