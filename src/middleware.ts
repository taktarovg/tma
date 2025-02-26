// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Динамический импорт серверного token.ts для API
let serverTokenModule: typeof import('@/lib/token') | null = null;
async function loadServerTokenModule() {
  if (!serverTokenModule) {
    serverTokenModule = await import('@/lib/token');
  }
  return serverTokenModule;
}

// Публичные маршруты, доступные без авторизации
const publicRoutes = [
  '/',
  '/api/auth/telegram',
  '/api/auth/telegram/check',
  '/api/categories',
];

// Статические пути для ресурсов
const staticPaths = [
  '/_next',
  '/images',
  '/uploads',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware handling path:', pathname);

  // Проверяем, что мы в Node.js Runtime
  if (typeof process === 'undefined') {
    console.error('Middleware is running in Edge Runtime, expected Node.js Runtime');
    return NextResponse.next(); // Временно пропускаем, чтобы отладить
  } else {
    console.log('Middleware is running in Node.js Runtime');
  }

  // Проверяем наличие модулей crypto и stream
  try {
    const crypto = await import('crypto');
    console.log('Crypto module is available in Node.js Runtime');
  } catch (error) {
    console.error('Crypto module is not available:', error);
  }

  try {
    const stream = await import('stream');
    console.log('Stream module is available in Node.js Runtime');
  } catch (error) {
    console.error('Stream module is not available:', error);
  }

  // Добавляем расширенное логирование заголовков
  console.log('Middleware headers:', {
    'user-agent': request.headers.get('user-agent'),
    'x-telegram-mini-app': request.headers.get('x-telegram-mini-app'),
    'x-telegram-web-app': request.headers.get('x-telegram-web-app'),
    allHeaders: Object.fromEntries([...request.headers.entries()]),
  });

  // Пропускаем статические файлы
  if (staticPaths.some(path => pathname.startsWith(path)) ||
      /\.(jpg|png|gif|ico|css|js)$/.test(pathname)) {
    return NextResponse.next();
  }

  // Проверка на Telegram Mini App
  const isTelegramMiniApp = request.headers.get('x-telegram-mini-app') === 'true';
  const userAgent = request.headers.get('user-agent') || '';
  const isTelegramUserAgent = userAgent.includes('TelegramWebApp') || userAgent.includes('Telegram');

  // Получаем токен из cookies через заголовок запроса
  const cookieHeader = request.headers.get('cookie');
  let sessionToken = null;
  if (cookieHeader) {
    const cookieMatch = cookieHeader.split('; ').find(row => row.startsWith('session_token='));
    sessionToken = cookieMatch ? cookieMatch.split('=')[1] : null;
  }
  console.log('Session token from cookie header:', sessionToken);

  // Используем токен из cookie или хедера (если есть)
  const authHeader = request.headers.get('Authorization');
  const headerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;
  console.log('Session token from header:', headerToken);

  const token = sessionToken || headerToken;

  let session = null;
  if (token) {
    try {
      console.log('Verifying token:', token);
      // Для всех маршрутов (API и клиентских) используем серверную логику
      const tokenModule = await loadServerTokenModule();
      const payload = tokenModule.getToken(token);
      if (payload?.userId) {
        session = { userId: payload.userId };
        console.log('Valid session found:', session);
      } else {
        console.warn('Invalid or expired token payload:', payload);
      }
    } catch (error) {
      console.error('Token validation error:', error);
    }
  }

  // Проверяем, является ли маршрут публичным
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('(.*)')) {
      const regexRoute = route.replace('(.*)', '.*');
      return new RegExp(`^${regexRoute}$`).test(pathname);
    }
    return route === pathname;
  });

  // Для API маршрутов
  if (pathname.startsWith('/api/')) {
    // Разрешаем запросы авторизации из Telegram
    if ((isTelegramMiniApp || isTelegramUserAgent) && pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }

    if (!session && !isPublicRoute) {
      return NextResponse.json(
        { error: 'Unauthorized', clientType: 'miniapp' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Если пользователь не авторизован и пытается получить доступ к защищённому маршруту (например, /services)
  if (!session && !isPublicRoute) {
    console.log('Unauthorized access attempt');

    // В режиме Telegram Mini App возвращаем 401 вместо редиректа
    if (isTelegramMiniApp || isTelegramUserAgent) {
      return NextResponse.json(
        { error: 'Unauthorized', clientType: 'miniapp' },
        { status: 401 }
      );
    }

    // Для веб-браузеров перенаправляем на корень
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Добавляем заголовки для Telegram Mini App
  const response = NextResponse.next();
  if (isTelegramMiniApp || isTelegramUserAgent) {
    response.headers.set('x-telegram-client-type', 'miniapp');
    response.headers.set('x-telegram-sdk-version', '3.4.0');
  }

  return response;
}

// Оптимизированный matcher для повышения производительности
export const config = {
  runtime: 'nodejs', // Явно указываем использование Node.js Runtime
  matcher: [
    '/services(.*)',
    '/master/bookings(.*)',
    '/master/schedule(.*)',
    '/profile(.*)',
    '/bookings(.*)',
    '/favorites(.*)',
    '/services/create(.*)',
    '/about(.*)',
    '/', // Главная страница (если она требует аутентификации)
    '/api/master/bookings(.*)', // API маршруты
    '/api/master/schedule(.*)',
    '/api/profile(.*)',
    '/api/services(.*)',
    '/api/bookings(.*)',
    '/api/favorites(.*)',
  ],
};