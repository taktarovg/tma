// src/app/api/master/bookings/route.ts

export const dynamic = 'force-dynamic'

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';
import { parse, startOfDay, endOfDay } from 'date-fns';

const querySchema = z.object({
    date: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED']).optional(),
});

export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const masterProfile = await prisma.masterProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!masterProfile) {
            return NextResponse.json({ error: 'Master profile not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const query = querySchema.parse({
            date: searchParams.get('date') || undefined,
            status: searchParams.get('status') || undefined,
        });

        const where = {
            masterId: masterProfile.id,
            ...(query.date && {
                bookingDateTime: {
                    gte: startOfDay(parse(query.date, 'yyyy-MM-dd', new Date())),
                    lte: endOfDay(parse(query.date, 'yyyy-MM-dd', new Date())),
                },
            }),
            ...(query.status && { status: query.status }),
        };

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        duration: true,
                        price: true,
                        image: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                bookingDateTime: 'asc',
            },
        });

        // Преобразуем Decimal в число
        const transformedBookings = bookings.map(booking => ({
            ...booking,
            service: {
                ...booking.service,
                price: booking.service.price ? Number(booking.service.price) : 0,
            },
        }));

        const totalBookings = transformedBookings.length;
        const confirmedBookings = transformedBookings.filter(b => b.status === 'CONFIRMED').length;
        const pendingBookings = transformedBookings.filter(b => b.status === 'PENDING').length;

        return NextResponse.json({
            bookings: transformedBookings,
            stats: {
                totalBookings,
                confirmedBookings,
                pendingBookings,
            },
        });
    } catch (error) {
        console.error('Bookings fetch error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}