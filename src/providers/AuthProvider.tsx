// src/providers/AuthProvider.tsx
'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramClient } from '@/components/TelegramClientProvider';
import type { User } from '@prisma/client';

// Импорт клиентского token.ts
import { getClientToken, setClientToken, removeClientToken } from '@/lib/client-token';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Серверная функция для авторизации (должна быть вызвана через API)
async function serverAuthenticate(telegramData: any): Promise<{ user: User; token: string }> {
  const response = await fetch('/api/auth/telegram', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Mini-App': 'true',
    },
    body: JSON.stringify(telegramData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Authentication failed');
  }

  return response.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isReady, isInTelegram, user: telegramUser, error: telegramError } = useTelegramClient();

  // Очистка старого токена при первой загрузке
  useEffect(() => {
    removeClientToken();
  }, []);

  // Выполняем автоматическую авторизацию при наличии данных пользователя Telegram
  useEffect(() => {
    const authenticateUser = async () => {
      console.log('AuthProvider authenticateUser - isReady:', isReady, 'isInTelegram:', isInTelegram, 'telegramUser:', !!telegramUser, 'isLoading:', isLoading, 'user:', !!user, 'telegramError:', telegramError);
      
      if (!isReady) return;

      if (!isInTelegram || !telegramUser) {
        setError('Приложение должно быть открыто в Telegram');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const authData = {
          id: telegramUser.id,
          first_name: telegramUser.firstName,
          last_name: telegramUser.lastName || '',
          username: telegramUser.username || '',
          photo_url: telegramUser.photoUrl || '',
          auth_date: Math.floor(Date.now() / 1000),
          hash: '', // Хеш не нужен, если используем initData
          client_type: 'miniapp',
          is_premium: telegramUser.isPremium || false,
        };

        console.log('Sending auth request with data:', authData);

        // Вызываем серверную функцию авторизации
        const { user: newUser, token } = await serverAuthenticate(authData);
        setUser(newUser);
        console.log('Authentication successful:', newUser, 'Token:', token);

        // Устанавливаем токен на клиенте
        setClientToken(token);

        if (newUser.isNewUser || !newUser.city || !newUser.district) {
          router.push('/profile/edit');
        } else {
          router.push('/services'); // Перенаправляем на защищённый маршрут после авторизации
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        toast({
          title: 'Ошибка',
          description: 'Не удалось выполнить вход',
          variant: 'destructive',
        });
      }

      setIsLoading(false); // Убедимся, что isLoading становится false после завершения
    };

    if (telegramUser && !user) {
      authenticateUser();
    } else if (telegramError) {
      setError(telegramError);
      setIsLoading(false);
    } else if (user) {
      setIsLoading(false);
    }
  }, [isReady, isInTelegram, telegramUser, telegramError, user, router, toast]);

  // Функция выхода из аккаунта
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      // Удаляем сессию на клиенте
      removeClientToken();
      router.push('/');
      
      toast({
        title: 'Выход выполнен',
        description: 'Вы успешно вышли из аккаунта',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить выход',
        variant: 'destructive',
      });
    }
  };

  const value = {
    user,
    isLoading,
    error,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}