// src/app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingNotification } from '@/lib/telegram';
import { bookingSchema } from '@/types/booking';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = bookingSchema.parse(body);

    const booking = await prisma.booking.create({
      data: {
        serviceId: validatedData.serviceId,
        userId: validatedData.userId,
        masterId: validatedData.masterId,
        bookingDateTime: new Date(`${validatedData.date}T${validatedData.time}:00`),
        cancelDeadline: new Date(validatedData.cancelDeadline),
        status: validatedData.status || 'PENDING',
        notes: validatedData.notes,
      },
      include: {
        user: {
          select: {
            telegramId: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        service: {
          include: {
            master: {
              include: {
                user: {
                  select: {
                    telegramId: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
                city: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                district: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        master: {
          include: {
            user: {
              select: {
                telegramId: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            city: {
              select: {
                id: true,
                name: true,
              },
            },
            district: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const masterChatId = booking.master.user.telegramId;
    const clientChatId = booking.user.telegramId;

    if (!masterChatId || !clientChatId) {
      console.log('Missing Telegram IDs for notification');
    } else {
      await sendBookingNotification(booking, masterChatId, clientChatId);
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}