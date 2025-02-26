// src/app/api/bookings/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { isBefore } from 'date-fns';

export async function DELETE(
    request: NextRequest, // Обновили тип с Request на NextRequest
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession(request); // Передаем request в getSession
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const booking = await prisma.booking.findUnique({
            where: {
                id: parseInt(params.id),
            },
            include: {
                service: {
                    include: {
                        master: {
                            include: {
                                user: {
                                    select: {
                                        telegramId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Проверяем, принадлежит ли запись пользователю
        if (booking.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Проверяем, не истек ли срок отмены
        if (booking.cancelDeadline && isBefore(new Date(), booking.cancelDeadline)) {
            return NextResponse.json(
                { error: 'Cancellation deadline has passed' },
                { status: 400 }
            );
        }

        // Отменяем запись
        const canceledBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'CANCELED' },
            include: {
                service: {
                    include: {
                        master: {
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        telegramId: true,
                                    },
                                },
                            },
                        },
                    },
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        telegramId: true,
                    },
                },
            },
        });

        // TODO: Отправка уведомлений через Telegram
        // await sendCancellationNotification(canceledBooking)

        return NextResponse.json(canceledBooking);
    } catch (error) {
        console.error('Booking cancellation error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel booking' },
            { status: 500 }
        );
    }
}