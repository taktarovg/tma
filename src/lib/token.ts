// src/lib/token.ts
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

interface TokenPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

export function setToken(payload: TokenPayload): string {
  if (!payload.userId || typeof payload.userId !== 'number') {
    throw new Error('Invalid userId in token payload');
  }

  const tokenPayload: TokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 часа
  };

  return jwt.sign(tokenPayload, JWT_SECRET);
}

export function getToken(token: string): TokenPayload | null {
  try {
    // Проверяем, что мы в Node.js Runtime (process существует)
    if (typeof process === 'undefined') {
      console.warn('Running in Edge Runtime, token verification not supported');
      return null;
    }

    // Проверяем наличие модулей crypto и stream
    try {
      require('crypto');
      require('stream');
    } catch (error) {
      console.error('Required Node.js modules (crypto/stream) are not available:', error);
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    if (decoded && typeof decoded === 'object' && 'userId' in decoded && typeof decoded.userId === 'number') {
      return decoded as TokenPayload;
    }
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}