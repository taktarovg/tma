// src/hooks/useTelegramAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { useTelegramClient } from '@/components/TelegramClientProvider';
import { useAuthContext } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface UseTelegramAuthOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectOnSuccess?: string;
  redirectOnError?: string;
}

export function useTelegramAuth(options: UseTelegramAuthOptions = {}) {
  const {
    onSuccess,
    onError,
    redirectOnSuccess = '/profile', // Изменено: перенаправляем на профиль по умолчанию
    redirectOnError = '/'
  } = options;

  const router = useRouter();
  const { toast } = useToast();
  const { isReady, isInTelegram, user: telegramUser, error: telegramError } = useTelegramClient();
  const { user, isLoading, error: authError } = useAuthContext();
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Эффект для отслеживания состояния авторизации
  useEffect(() => {
    // Если авторизация в процессе, не делаем ничего
    if (isAuthenticating) return;
    
    // Если уже авторизованы, считаем это успехом
    if (user) {
      setIsSuccess(true);
      onSuccess?.();
      return;
    }

    // Если авторизация еще не готова, ждем
    if (!isReady || isLoading) return;

    // Если возникла ошибка, обрабатываем ее
    if (telegramError || authError) {
      const errorMessage = telegramError || authError || 'Ошибка авторизации';
      const errorObj = new Error(errorMessage);
      setError(errorObj);
      onError?.(errorObj);
      
      // Уведомляем о проблеме
      toast({
        title: 'Ошибка авторизации',
        description: errorMessage,
        variant: 'destructive',
      });

      // Если задан редирект для ошибки, выполняем его
      if (redirectOnError && !redirectAttempted) {
        setRedirectAttempted(true);
        // Используем setTimeout для обеспечения надежного перехода
        setTimeout(() => {
          router.push(redirectOnError);
        }, 100);
      }
    }
  }, [
    isReady, isInTelegram, telegramUser, telegramError,
    user, isLoading, authError, isAuthenticating, isSuccess,
    onSuccess, onError, redirectOnSuccess, redirectOnError,
    router, toast, redirectAttempted
  ]);

  // Эффект для редиректа после успешной авторизации
  useEffect(() => {
    if (isSuccess && redirectOnSuccess && !redirectAttempted && !isAuthenticating) {
      console.log('Redirecting to profile after auth success');
      setRedirectAttempted(true);
      
      // Используем более надежный способ перенаправления через setTimeout
      setTimeout(() => {
        console.log('Executing redirect to:', redirectOnSuccess);
        window.location.href = redirectOnSuccess; // Принудительное перенаправление через window.location
      }, 300);
    }
  }, [isSuccess, redirectOnSuccess, isAuthenticating, redirectAttempted]);

  return {
    isAuthenticated: !!user,
    isAuthenticating: isAuthenticating || isLoading,
    isSuccess,
    error,
    telegramUser,
    user,
    // Добавляем функцию для явного перенаправления
    redirectToProfile: () => {
      if (user) {
        console.log('Manually redirecting to profile');
        window.location.href = '/profile';
      }
    }
  };
}

export default useTelegramAuth;