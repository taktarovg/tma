// src/app/api/profile/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

const profileSchema = z.object({
    firstName: z.string().min(1, "Имя обязательно"),
    lastName: z.string().min(1, "Фамилия обязательна"),
    cityId: z.string().nullable().transform(val =>
        val && val !== '' ? parseInt(val) : null
    ),
    districtId: z.string().nullable().transform(val =>
        val && val !== '' ? parseInt(val) : null
    ),
    avatar: z.string().nullable(),
});

export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession(request); // Передаем request для серверного извлечения токена
        console.log('Session in profile update:', session);

        if (!session?.user?.id) {
            console.log('No user id in session');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log('Update profile request body:', body);

        const validatedData = profileSchema.parse(body);
        console.log('Validated data:', validatedData);

        // Подготавливаем данные для обновления
        const updateData = {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            avatar: validatedData.avatar,
            cityId: validatedData.cityId,
            districtId: validatedData.districtId,
        };

        // Фильтруем null значения
        const filteredUpdateData = Object.fromEntries(
            Object.entries(updateData).filter(([_, value]) => value !== null)
        );

        console.log('Final update data:', filteredUpdateData);

        const user = await prisma.user.update({
            where: {
                id: session.user.id, // session.user.id уже number, parseInt не нужен
            },
            data: filteredUpdateData,
            include: {
                city: true,
                district: true,
            },
        });

        console.log('Updated user:', user);
        return NextResponse.json(user);
    } catch (error) {
        console.error('Profile update error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request); // Передаем request для серверного извлечения токена

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id, // session.user.id уже number, parseInt не нужен
            },
            include: {
                city: true,
                district: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        console.log('Fetched user:', user);
        return NextResponse.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}