// src/lib/session.ts
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { verifyTokenInEdge } from './edge-jwt';

/**
 * Получает сессию пользователя из токена в cookies или хедере авторизации
 * @param request - объект запроса NextRequest
 * @returns объект сессии или null
 */
export async function getSession(request: Request) {
  // Извлекаем токен из cookies
  let sessionToken = null;
  
  // Для серверных компонентов Next.js используем cookies()
  if (typeof cookies === 'function') {
    const cookieStore = cookies();
    sessionToken = cookieStore.get('session_token')?.value;
  }
  
  // Проверяем наличие токена в хедере авторизации (для Mini App)
  if (!sessionToken && request.headers) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }
  }
  
  if (!sessionToken) return null;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    let decoded;
    
    try {
      // Стандартная проверка JWT-токена
      decoded = verify(sessionToken, secret) as { userId: number };
    } catch (e) {
      console.log('Standard token verification failed in getSession, trying edge method:', e);
      // Если стандартная проверка не сработала, используем альтернативный метод
      decoded = verifyTokenInEdge(sessionToken, secret);
    }

    if (!decoded || !decoded.userId) {
      console.log('Token decoded but no userId found');
      return null;
    }

    // Используем Prisma для получения данных пользователя
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        city: true,
        district: true,
        masterProfile: true
      }
    });

    return user ? { user } : null;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

/**
 * Создает сессионный токен (JWT) для пользователя
 * @param userId - ID пользователя
 * @returns Promise<string> - сгенерированный JWT-токен
 */
export async function createSession(userId: number): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  // Для Telegram Mini App используем более долгий срок жизни токена
  return sign({ userId }, secret, { expiresIn: '30d' });
}

/**
 * Очищает сессию пользователя
 * @returns Promise<void>
 */
export async function clearSession(): Promise<void> {
  return Promise.resolve();
}