// src/app/api/favorites/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function DELETE(
    request: NextRequest, // Обновили тип с Request на NextRequest для явности
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession(request); // Передаем request в getSession
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const favorite = await prisma.favorite.delete({
            where: {
                id: parseInt(params.id),
                userId: session.user.id, // Убедимся, что удаляется только запись текущего пользователя
            },
        });

        return NextResponse.json(favorite);
    } catch (error) {
        console.error('Favorite deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete favorite' },
            { status: 500 }
        );
    }
}