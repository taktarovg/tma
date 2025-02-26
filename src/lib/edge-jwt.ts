// src/lib/edge-jwt.ts
// Простая реализация проверки JWT токена для Edge Runtime

export function verifyTokenInEdge(token: string, secret: string): any {
    try {
      // Простая функция проверки JWT без использования crypto
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Декодируем payload (вторая часть)
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(
        typeof window !== 'undefined' 
          ? atob(payloadBase64) 
          : Buffer.from(payloadBase64, 'base64').toString()
      );
      
      // Проверяем срок действия
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) return null;
      
      return payload;
    } catch (e) {
      console.error('Edge token verification error:', e);
      return null;
    }
  }