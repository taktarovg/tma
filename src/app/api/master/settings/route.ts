// src/app/api/master/settings/route.ts

export const dynamic = 'force-dynamic'

import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
    bufferTime: z.number().min(0).max(60),
    cancelDeadline: z.number().min(1).max(72),
    autoConfirm: z.boolean(),
});

export async function GET(request: NextRequest) { // Добавили NextRequest как тип
    try {
        const session = await getSession(request); // Передаем request в getSession
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const masterProfile = await prisma.masterProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                settings: true,
            },
        });

        if (!masterProfile) {
            return NextResponse.json({ error: 'Master profile not found' }, { status: 404 });
        }

        // Если настройки не существуют, создаем дефолтные
        if (!masterProfile.settings) {
            const defaultSettings = await prisma.masterSettings.create({
                data: {
                    masterId: masterProfile.id,
                    bufferTime: 15,
                    cancelDeadline: 24,
                    autoConfirm: false,
                },
            });
            return NextResponse.json(defaultSettings);
        }

        return NextResponse.json(masterProfile.settings);
    } catch (error) {
        console.error('Settings fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) { // Обновили тип с Request на NextRequest
    try {
        const session = await getSession(request); // Передаем request в getSession
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const masterProfile = await prisma.masterProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!masterProfile) {
            return NextResponse.json({ error: 'Master profile not found' }, { status: 404 });
        }

        const body = await request.json();
        const validatedData = settingsSchema.parse(body);

        const settings = await prisma.masterSettings.upsert({
            where: {
                masterId: masterProfile.id,
            },
            update: validatedData,
            create: {
                ...validatedData,
                masterId: masterProfile.id,
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Settings update error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input data', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}