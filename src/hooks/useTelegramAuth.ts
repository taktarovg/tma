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
    redirectOnSuccess = '/',
    redirectOnError = '/'
  } = options;

  const router = useRouter();
  const { toast } = useToast();
  const { isReady, isInTelegram, user: telegramUser, error: telegramError } = useTelegramClient();
  const { user, isLoading, error: authError } = useAuthContext();
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
      if (redirectOnError) {
        router.push(redirectOnError);
      }
    }
  }, [
    isReady, isInTelegram, telegramUser, telegramError,
    user, isLoading, authError, isAuthenticating, isSuccess,
    onSuccess, onError, redirectOnSuccess, redirectOnError,
    router, toast
  ]);

  // Эффект для редиректа после успешной авторизации
  useEffect(() => {
    if (isSuccess && redirectOnSuccess && !isAuthenticating) {
      router.push(redirectOnSuccess);
    }
  }, [isSuccess, redirectOnSuccess, isAuthenticating, router]);

  return {
    isAuthenticated: !!user,
    isAuthenticating: isAuthenticating || isLoading,
    isSuccess,
    error,
    telegramUser,
    user
  };
}

export default useTelegramAuth;