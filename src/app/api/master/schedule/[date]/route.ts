// src/app/api/master/schedule/[date]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';
import { parse, isValid, startOfDay, endOfDay } from 'date-fns';

// Добавляем GET метод
export async function GET(
    request: NextRequest, // Обновили тип с Request на NextRequest
    { params }: { params: { date: string } }
) {
    try {
        console.log('=== Schedule GET Start ===');
        console.log('Getting schedule for date:', params.date);

        const session = await getSession(request); // Передаем request в getSession
        if (!session?.user) {
            console.log('No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const date = parse(params.date, 'yyyy-MM-dd', new Date());
        if (!isValid(date)) {
            console.log('Invalid date:', params.date);
            return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
        }

        const masterProfile = await prisma.masterProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!masterProfile) {
            console.log('Master profile not found');
            return NextResponse.json({ error: 'Master profile not found' }, { status: 404 });
        }

        const schedule = await prisma.daySchedule.findUnique({
            where: {
                masterId_date: {
                    masterId: masterProfile.id,
                    date,
                },
            },
        });

        // Получаем все записи на этот день
        const bookings = await prisma.booking.findMany({
            where: {
                masterId: masterProfile.id,
                bookingDateTime: {
                    gte: startOfDay(date),
                    lte: endOfDay(date),
                },
            },
            include: {
                service: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });

        console.log('Found schedule:', schedule ? 'yes' : 'no');
        console.log('Bookings count:', bookings.length);
        console.log('=== Schedule GET End ===');

        return NextResponse.json({ schedule, bookings });
    } catch (error) {
        console.error('Schedule GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schedule' },
            { status: 500 }
        );
    }
}

// Существующий POST метод остается без изменений
export { POST } from './post';