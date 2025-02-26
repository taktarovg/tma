// src/app/api/favorites/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const querySchema = z.object({
  cursor: z.string().nullish(),
  sortBy: z.enum(['newest', 'oldest']).nullish().transform(val => val ?? 'newest'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request); // Передаем request в getSession
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { cursor, sortBy } = querySchema.parse({
      cursor: searchParams.get('cursor'),
      sortBy: searchParams.get('sortBy'),
    });

    const take = 10;

    // Получаем избранные услуги
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: parseInt(cursor) } } : {}),
      orderBy: {
        createdAt: sortBy === 'newest' ? 'desc' : 'asc',
      },
      include: {
        service: {
          include: {
            master: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    isPremium: true,
                  },
                },
                city: true,
                district: true,
              },
            },
            category: {
              include: {
                parent: true,
              },
            },
            _count: {
              select: {
                favorites: true,
              },
            },
          },
        },
      },
    });

    let nextCursor: typeof cursor;
    if (favorites.length > take) {
      const nextItem = favorites.pop();
      nextCursor = nextItem?.id.toString();
    }

    const transformedFavorites = favorites.map(favorite => ({
      id: favorite.service.id,
      title: favorite.service.name,
      price: Number(favorite.service.price),
      duration: `${favorite.service.duration} мин`,
      master: {
        name: `${favorite.service.master.user.firstName} ${favorite.service.master.user.lastName}`,
        isPremium: favorite.service.master.user.isPremium,
        avatar: favorite.service.master.user.avatar,
      },
      category: {
        parent: favorite.service.category.parent?.name,
        name: favorite.service.category.name,
      },
      location: {
        city: favorite.service.master.city.name,
        district: favorite.service.master.district.name,
      },
      stats: {
        views: favorite.service.viewsCount,
        favorites: favorite.service._count.favorites,
      },
      image: favorite.service.image,
    }));

    return NextResponse.json({
      favorites: transformedFavorites,
      nextCursor,
    });
  } catch (error) {
    console.error('Favorites fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request); // Передаем request в getSession
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId } = body;

    // Проверяем, существует ли уже такая запись
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        serviceId: Number(serviceId),
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { message: 'Already in favorites' },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        serviceId: Number(serviceId),
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('Add to favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}