// src/components/telegram/TelegramAutoAuth.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramClient } from '@/components/TelegramClientProvider';
import { useAuthContext } from '@/providers/AuthProvider';
import { redirectToProfile } from '@/lib/profile-redirect';

interface AuthState {
  isInitializing: boolean;
  isAuthorized: boolean;
  error: string | null;
}

export default function TelegramAutoAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading } = useAuthContext();
  const { isReady, isInTelegram, user: telegramUser, error: telegramError } = useTelegramClient();
  
  const [authState, setAuthState] = useState<AuthState>({
    isInitializing: true,
    isAuthorized: false,
    error: null,
  });

  // Добавляем состояние для отслеживания редиректа
  const [redirected, setRedirected] = useState(false);

  // Эффект для автоматической авторизации в Telegram Mini App
  useEffect(() => {
    const initAuth = async () => {
      console.log('TelegramAutoAuth initAuth - isReady:', isReady, 'isInTelegram:', isInTelegram, 'telegramUser:', !!telegramUser, 'isLoading:', isLoading, 'user:', !!user, 'telegramError:', telegramError);
      
      if (!isReady) return;

      if (!isInTelegram || !telegramUser) {
        setAuthState({
          isInitializing: false,
          isAuthorized: false,
          error: 'Приложение должно быть открыто в Telegram',
        });
        return;
      }

      try {
        // Проверяем статус инициализации Telegram SDK
        if (!isReady) {
          return;
        }

        // Проверяем, запущено ли приложение в Telegram
        if (!isInTelegram) {
          setAuthState({
            isInitializing: false,
            isAuthorized: false,
            error: 'Приложение должно быть открыто в Telegram',
          });
          return;
        }

        // Если у нас уже есть пользователь в контексте и загрузка завершена, перенаправляем на защищённый маршрут
        if (user && !isLoading && !redirected) {
          console.log('User authenticated, redirecting to profile');
          setAuthState({
            isInitializing: false,
            isAuthorized: true,
            error: null,
          });
          
          // Устанавливаем флаг, что перенаправление уже было выполнено
          setRedirected(true);
          
          // Используем более надежное перенаправление
          redirectToProfile();
          return;
        }

        // Проверяем наличие данных пользователя из Telegram
        if (!telegramUser) {
          setAuthState({
            isInitializing: false,
            isAuthorized: false,
            error: 'Не удалось получить данные пользователя Telegram',
          });
          return;
        }

        // Статус ожидания завершения авторизации
        setAuthState({
          isInitializing: true,
          isAuthorized: false,
          error: null,
        });

        // Здесь мы просто ждём, пока AuthProvider завершит авторизацию
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        setAuthState({
          isInitializing: false,
          isAuthorized: false,
          error: error instanceof Error ? error.message : 'Ошибка инициализации авторизации',
        });
        
        toast({
          title: 'Ошибка',
          description: 'Не удалось выполнить авторизацию',
          variant: 'destructive',
        });
      }
    };

    initAuth();
  }, [isReady, isInTelegram, telegramUser, telegramError, user, isLoading, router, toast, redirected]);

  // Отслеживаем завершение авторизации в AuthProvider
  useEffect(() => {
    if (user && !isLoading && !redirected) {
      console.log('User authenticated from TelegramAutoAuth, redirecting to profile');
      setAuthState({
        isInitializing: false,
        isAuthorized: true,
        error: null,
      });
      
      // Устанавливаем флаг, что перенаправление уже было выполнено
      setRedirected(true);
      
      // Используем более надежное перенаправление
      redirectToProfile();
    }
  }, [user, isLoading, router, redirected]);

  // Отображаем процесс инициализации
  if (authState.isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium">
            Подключение к Telegram...
          </div>
          <div className="text-sm text-gray-500">
            Пожалуйста, подождите
          </div>
        </div>
      </div>
    );
  }

  // Отображаем сообщение об ошибке
  if (authState.error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-red-600">
            {authState.error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // При успешной авторизации показываем сообщение о перенаправлении
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg font-medium">
          Перенаправление на профиль...
        </div>
        <div className="mt-2">
          <button 
            onClick={() => {
              redirectToProfile({ useWindowLocation: true });
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md mt-4"
          >
            Перейти вручную
          </button>
        </div>
      </div>
    </div>
  );
}