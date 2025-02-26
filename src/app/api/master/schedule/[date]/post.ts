// src/app/api/master/schedule/[date]/post.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { parse, isValid } from 'date-fns';

const timeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);

const breakSchema = z.object({
    start: timeSchema,
    end: timeSchema,
});

const scheduleSchema = z.object({
    workHours: z.object({
        start: timeSchema,
        end: timeSchema,
    }),
    breaks: z.array(breakSchema).default([]),
});

export async function POST(
    request: NextRequest, // Обновили тип с Request на NextRequest
    { params }: { params: { date: string } }
) {
    try {
        console.log('=== Schedule Save Start ===');
        console.log('Saving schedule for date:', params.date);

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

        const body = await request.json();
        console.log('Received schedule data:', body);

        const validatedData = scheduleSchema.parse(body);

        // Создаем или обновляем расписание
        const schedule = await prisma.daySchedule.upsert({
            where: {
                masterId_date: {
                    masterId: masterProfile.id,
                    date,
                },
            },
            update: {
                workHours: validatedData.workHours,
                breaks: validatedData.breaks,
            },
            create: {
                masterId: masterProfile.id,
                date,
                workHours: validatedData.workHours,
                breaks: validatedData.breaks,
            },
        });

        console.log('Saved schedule:', schedule);

        // Принудительно обновляем кэш для страниц, которые могут использовать эти данные
        revalidatePath('/api/services/[id]/available-dates');
        revalidatePath('/api/master/schedule');
        revalidatePath(`/api/master/schedule/${params.date}`);

        console.log('=== Schedule Save End ===');

        return NextResponse.json({
            success: true,
            schedule,
        });
    } catch (error) {
        console.error('Schedule save error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to save schedule' },
            { status: 500 }
        );
    }
}