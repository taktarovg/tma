'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramClient } from '@/components/TelegramClientProvider';
import { useAuthContext } from '@/providers/AuthProvider';
import TelegramAutoAuth from '@/components/telegram/TelegramAutoAuth';
import { redirectToProfile } from '@/lib/profile-redirect';

export default function HomePage() {
  const router = useRouter();
  const { isReady, isInTelegram } = useTelegramClient();
  const { user, isLoading } = useAuthContext();

  // Добавляем логирование для отладки
  useEffect(() => {
    console.log('HomePage render - isReady:', isReady, 'isInTelegram:', isInTelegram, 'user:', !!user, 'isLoading:', isLoading);
  }, [isReady, isInTelegram, user, isLoading]);

  // Эффект для редиректа после успешной авторизации
  useEffect(() => {
    if (isReady && !isLoading && user) {
      console.log('User authenticated, redirecting to profile page');
      // Используем функцию надежного перенаправления
      redirectToProfile();
    }
  }, [isReady, isLoading, user, router]);

  // Если инициализация Telegram SDK или авторизация еще не завершены,
  // показываем компонент автоматической авторизации
  if (isLoading || !isReady) {
    return <TelegramAutoAuth />;
  }

  // Если приложение не запущено в Telegram, показываем ошибку
  if (!isInTelegram) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-4">
          <h1 className="text-xl font-bold mb-4">TopInBeauty</h1>
          <p className="mb-4">
            Это приложение необходимо открыть в Telegram.
          </p>
          <a 
            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`}
            className="px-4 py-2 bg-blue-500 text-white rounded-md inline-block"
          >
            Открыть в Telegram
          </a>
        </div>
      </div>
    );
  }

  // Если авторизация не произошла автоматически,
  // показываем компонент автоматической авторизации
  if (!user) {
    return <TelegramAutoAuth />;
  }

  // Добавляем кнопку для принудительного перенаправления
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg font-medium">
          Перенаправление на профиль...
        </div>
        <button 
          onClick={() => redirectToProfile()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md mt-4"
        >
          Перейти вручную
        </button>
      </div>
    </div>
  );
}