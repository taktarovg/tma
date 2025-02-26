// src/app/api/auth/telegram/route.ts
export const runtime = 'nodejs'; // Явно указываем использование Node.js Runtime

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setToken } from '@/lib/token';
import { z } from 'zod';

// Схема валидации данных пользователя от Telegram Mini App
const telegramAuthSchema = z.object({
  id: z.number().int(),
  first_name: z.string(),
  last_name: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  auth_date: z.number().int(),
  hash: z.string().optional(),
  client_type: z.enum(['miniapp']),
  is_premium: z.boolean().optional(),
}).strict();

export async function POST(request: NextRequest) {
  console.log('=== Telegram Mini App Auth Request ===');
  console.log('Headers:', Object.fromEntries([...request.headers.entries()]));

  try {
    // Проверяем источник запроса
    const isMiniApp = request.headers.get('x-telegram-mini-app') === 'true';
    const userAgent = request.headers.get('user-agent') || '';
    const isTelegramUserAgent = userAgent.includes('TelegramWebApp') || userAgent.includes('Telegram');

    console.log('Request auth info:', { isMiniApp, isTelegramUserAgent, userAgent });

    if (!isMiniApp && !isTelegramUserAgent) {
      console.log('Not a Telegram request, but will proceed for testing');
      // Продолжаем для тестирования, но логируем это
    }

    const rawData = await request.json();
    console.log('Raw auth data:', rawData);

    // Валидируем данные от Telegram
    const validatedData = telegramAuthSchema.parse(rawData);
    console.log('Validated data:', validatedData);

    // Ищем существующего пользователя
    let user = await prisma.user.findUnique({
      where: {
        telegramId: validatedData.id.toString(),
      },
      include: {
        city: true,
        district: true,
        masterProfile: {
          include: {
            city: true,
            district: true,
          },
        },
      },
    });

    let isNewUser = false;

    if (user) {
      // Обновляем существующего пользователя
      user = await prisma.user.update({
        where: {
          telegramId: validatedData.id.toString(),
        },
        data: {
          username: validatedData.username || user.username,
          firstName: validatedData.first_name || user.firstName,
          lastName: validatedData.last_name || user.lastName,
          avatar: validatedData.photo_url || user.avatar,
          isPremium: validatedData.is_premium || user.isPremium,
        },
        include: {
          city: true,
          district: true,
          masterProfile: {
            include: {
              city: true,
              district: true,
            },
          },
        },
      });
      console.log('Updated existing user:', user.id);
    } else {
      // Создаём нового пользователя
      user = await prisma.user.create({
        data: {
          telegramId: validatedData.id.toString(),
          username: validatedData.username || '',
          firstName: validatedData.first_name,
          lastName: validatedData.last_name || '',
          avatar: validatedData.photo_url || '',
          role: 'USER',
          isPremium: validatedData.is_premium || false,
        },
        include: {
          city: true,
          district: true,
          masterProfile: {
            include: {
              city: true,
              district: true,
            },
          },
        },
      });
      console.log('Created new user:', user.id);
      isNewUser = true;
    }

    // Создаём JWT-токен для сессии с помощью setToken
    const token = setToken({ userId: user.id });

    // Формируем ответ
    const response = {
      success: true,
      user: {
        ...user,
        isNewUser, // Проверяем, новый ли пользователь
      },
      token, // Возвращаем JWT-токен
    };

    console.log('Session created:', !!token);

    // Возвращаем успешный ответ
    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Set-Cookie': `session_token=${token}; Path=/; Max-Age=2592000; SameSite=None; ${request.url.startsWith('https') ? 'Secure' : ''}`
      }
    });
  } catch (error) {
    console.error('Auth error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: 'Auth failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  } finally {
    console.log('=== Telegram Mini App Auth End ===');
  }
}

// Добавляем маршрут для проверки подключения
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}