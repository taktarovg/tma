'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramClient } from '@/components/TelegramClientProvider';
import { useAuthContext } from '@/providers/AuthProvider';
import TelegramAutoAuth from '@/components/telegram/TelegramAutoAuth';

export default function HomePage() {
  const router = useRouter();
  const { isReady, isInTelegram } = useTelegramClient();
  const { user, isLoading } = useAuthContext();

  // Эффект для редиректа после успешной авторизации
  useEffect(() => {
    if (isReady && !isLoading && user) {
      // Пользователь авторизован - перенаправляем на главную страницу сервисов
      router.push('/services');
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

  // Этот код не должен выполняться, так как мы должны
  // перенаправиться на /services при успешной авторизации
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg font-medium">
          Перенаправление...
        </div>
      </div>
    </div>
  );
}