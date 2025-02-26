// src/app/api/master/bookings/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { BookingStatus } from '@prisma/client';

const updateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED']),
});

export async function PATCH(
  request: NextRequest, // Обновили тип с Request на NextRequest
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request); // Передаем request в getSession
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = updateSchema.parse(body);

    // Получаем профиль мастера
    const masterProfile = await prisma.masterProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!masterProfile) {
      return NextResponse.json({ error: 'Master profile not found' }, { status: 404 });
    }

    // Получаем бронирование
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            telegramId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Проверяем, принадлежит ли запись этому мастеру
    if (booking.masterId !== masterProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Проверяем возможность изменения статуса
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELED') {
      return NextResponse.json(
        { error: 'Cannot update completed or canceled booking' },
        { status: 400 }
      );
    }

    // Обновляем статус записи
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            telegramId: true,
            firstName: true,
            lastName: true,
          },
        },
        master: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // TODO: Отправка уведомления в Telegram
    // Здесь будет логика отправки уведомления клиенту через бота
    // const bookingDate = format(new Date(updatedBooking.bookingDateTime), 'dd.MM.yyyy HH:mm')
    // const message = `Статус вашей записи на ${bookingDate} к мастеру ${updatedBooking.master.user.firstName} ${updatedBooking.master.user.lastName} изменен на "${getStatusText(status)}"`
    // await sendTelegramNotification(updatedBooking.user.telegramId, message)

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Booking update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// Вспомогательная функция для получения текста статуса записи
function getStatusText(status: BookingStatus): string {
  const statusTexts = {
    PENDING: 'Ожидает подтверждения',
    CONFIRMED: 'Подтверждена',
    CANCELED: 'Отменена',
    COMPLETED: 'Завершена',
  };
  return statusTexts[status];
}