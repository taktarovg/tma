// src/lib/client-token.ts
'use client';

export function getClientToken(): string | null {
  if (typeof document === 'undefined') {
    console.warn('Document is undefined, returning null for getClientToken');
    return null; // Возвращаем null на сервере
  }
  const cookie = document.cookie.split('; ').find(row => row.startsWith('session_token='));
  console.log('Cookies in getClientToken:', document.cookie);
  console.log('Session token from cookie:', cookie ? cookie.split('=')[1] : null);
  return cookie ? cookie.split('=')[1] : null;
}

export function setClientToken(token: string): void {
  if (typeof document === 'undefined') {
    console.warn('Document is undefined, skipping setClientToken');
    return; // Ничего не делаем на сервере
  }
  console.log('Setting session token:', token);
  // Устанавливаем secure и SameSite=None для работы в iframe
  document.cookie = `session_token=${token}; path=/; max-age=2592000; SameSite=None${window.location.protocol === 'https:' ? '; Secure' : ''}`; // 30 дней
}

export function removeClientToken(): void {
  if (typeof document === 'undefined') {
    console.warn('Document is undefined, skipping removeClientToken');
    return; // Ничего не делаем на сервере
  }
  console.log('Removing session token');
  document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure';
}