// src/app/api/services/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const createServiceSchema = z.object({
  name: z.string().min(1, 'Название услуги обязательно'),
  description: z.string(),
  price: z.number().min(0, 'Цена должна быть больше 0'),
  duration: z.number().min(15, 'Минимальная длительность 15 минут'),
  categoryId: z.union([
    z.number(),
    z.string().transform((val) => parseInt(val, 10)),
  ]),
  cityId: z.union([
    z.number(),
    z.string().transform((val) => parseInt(val, 10)),
  ]),
  districtId: z.union([
    z.number(),
    z.string().transform((val) => parseInt(val, 10)),
  ]),
  address: z.string().min(1, 'Адрес обязателен'),
  image: z.string().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting service creation...');
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rawData = await request.json();
    console.log('Raw service data:', rawData);

    const validatedData = createServiceSchema.parse(rawData);
    console.log('Validated service data:', validatedData);

    // Проверяем, есть ли у пользователя профиль мастера
    const existingMasterProfile = await prisma.masterProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        daySchedules: true,
        settings: true,
      },
    });

    let masterProfile = existingMasterProfile;

    // Если профиля мастера нет, создаем его вместе с базовым расписанием
    if (!masterProfile) {
      console.log('Creating new master profile with default schedule...');
      const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          city: true,
          district: true,
        },
      });

      if (!userData?.city || !userData?.district) {
        return NextResponse.json(
          { error: 'Необходимо указать город и район в профиле' },
          { status: 400 }
        );
      }

      masterProfile = await prisma.masterProfile.create({
        data: {
          userId: session.user.id,
          cityId: userData.city.id,
          districtId: userData.district.id,
          bio: '',
          address: validatedData.address,
          isVerified: false,
          // Создаем базовое расписание с правильной структурой DaySchedule
          daySchedules: {
            create: {
              date: new Date(), // Добавляем обязательное поле date (можно настроить)
              workHours: {
                start: "09:00",
                end: "18:00",
              },
              breaks: [{
                start: "13:00",
                end: "14:00",
              }],
            },
          },
          // Создаем базовые настройки
          settings: {
            create: {
              bufferTime: 15,
              cancelDeadline: 24,
              autoConfirm: false,
            },
          },
        },
        include: {
          daySchedules: true,
          settings: true,
        },
      });

      // Обновляем роль пользователя на MASTER
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: 'MASTER' },
      });
      console.log('Created master profile with schedule and settings');
    }

    // Создаем услугу
    console.log('Creating service...');
    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        duration: validatedData.duration,
        categoryId: validatedData.categoryId,
        masterId: masterProfile.id,
        image: validatedData.image,
        viewsCount: 0,
      },
    });

    console.log('Service created successfully:', service);
    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('Service creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create service',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}