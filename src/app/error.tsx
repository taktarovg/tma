// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTelegramClient } from '@/components/TelegramClientProvider';
import { showAlert } from '@/lib/telegram-sdk';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isInTelegram } = useTelegramClient();

  // Логирование ошибки
  useEffect(() => {
    console.error('Application error:', error);
    
    // Показываем нативное уведомление в Telegram Mini App
    if (isInTelegram) {
      showAlert(`Произошла ошибка: ${error.message}`);
    }
  }, [error, isInTelegram]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-600">
          Что-то пошло не так
        </h2>
        <p className="mb-6 text-gray-500">
          {error.message || 'Произошла непредвиденная ошибка в приложении.'}
        </p>
        
        <div className="flex flex-col gap-4">
          <Button onClick={() => reset()} className="w-full">
            Попробовать снова
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Вернуться на главную
          </Button>
        </div>
      </div>
    </div>
  );
}