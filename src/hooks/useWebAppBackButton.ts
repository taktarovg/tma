// src/hooks/useWebAppBackButton.ts
'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getWebApp } from '@/lib/telegram-sdk';
import type { TelegramWebApp } from '@/types/telegram';

interface UseBackButtonOptions {
  enabled?: boolean;
  onBack?: () => void | Promise<void>;
  preventDefaultNavigation?: boolean;
}

interface UseBackButtonResult {
  isReady: boolean;
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  error: Error | null;
}

export function useWebAppBackButton({
  enabled = true,
  onBack,
  preventDefaultNavigation = false
}: UseBackButtonOptions = {}): UseBackButtonResult {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const backButtonRef = useRef<TelegramWebApp['BackButton'] | null>(null);
  const isNavigatingRef = useRef(false);

  // Инициализация кнопки
  useEffect(() => {
    try {
      const webApp = getWebApp();

      if (!webApp?.BackButton) {
        console.log('BackButton is not available in this environment');
        return;
      }

      backButtonRef.current = webApp.BackButton;
      setIsReady(true);
    } catch (err) {
      console.error('BackButton initialization error:', err);
      setError(err instanceof Error ? err : new Error('Ошибка инициализации BackButton'));
      setIsReady(false);
    }
  }, []);

  // Обработчик нажатия на кнопку назад
  const handleBack = useCallback(async () => {
    // Предотвращаем повторное нажатие во время навигации
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;

    try {
      if (onBack) {
        await onBack();
      }

      if (!preventDefaultNavigation) {
        // Используем более надежное переключение страниц
        setTimeout(() => {
          router.back();
        }, 100);
      }
    } catch (err) {
      console.error('BackButton error:', err);
      setError(err instanceof Error ? err : new Error('Ошибка при навигации назад'));
    } finally {
      // Небольшая задержка для предотвращения быстрых повторных нажатий
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    }
  }, [onBack, preventDefaultNavigation, router]);

  // Управление видимостью и обработчиками
  useEffect(() => {
    const backButton = backButtonRef.current;
    if (!backButton || !isReady) return;

    try {
      if (enabled) {
        backButton.show();
        // В некоторых версиях SDK могут быть проблемы с прослушиванием события
        if (typeof backButton.onClick === 'function') {
          backButton.onClick(handleBack);
        }
        setIsVisible(true);
      } else {
        backButton.hide();
        setIsVisible(false);
      }
    } catch (err) {
      console.error('BackButton toggle error:', err);
      setError(err instanceof Error ? err : new Error('Ошибка при управлении кнопкой назад'));
    }

    return () => {
      try {
        backButton.hide();
        if (typeof backButton.offClick === 'function') {
          backButton.offClick(handleBack);
        }
        setIsVisible(false);
      } catch (err) {
        console.error('Error cleaning up BackButton:', err);
      }
    };
  }, [enabled, handleBack, isReady]);

  // Методы для внешнего управления кнопкой
  const show = useCallback(() => {
    const backButton = backButtonRef.current;

    if (backButton && isReady) {
      try {
        backButton.show();
        setIsVisible(true);
      } catch (err) {
        console.error('BackButton show error:', err);
      }
    }
  }, [isReady]);

  const hide = useCallback(() => {
    const backButton = backButtonRef.current;

    if (backButton && isReady) {
      try {
        backButton.hide();
        setIsVisible(false);
      } catch (err) {
        console.error('BackButton hide error:', err);
      }
    }
  }, [isReady]);

  return {
    isReady,
    isVisible,
    show,
    hide,
    error
  };
}

// Хук для предотвращения случайного закрытия приложения
export function useWebAppClosingConfirmation(enabled: boolean = true) {
  useEffect(() => {
    const webApp = getWebApp();

    if (webApp) {
      try {
        if (enabled && webApp.enableClosingConfirmation) {
          webApp.enableClosingConfirmation();
        } else if (webApp.disableClosingConfirmation) {
          webApp.disableClosingConfirmation();
        }
      } catch (e) {
        console.log('Error with closing confirmation:', e);
      }
    }

    return () => {
      try {
        if (webApp?.disableClosingConfirmation) {
          webApp.disableClosingConfirmation();
        }
      } catch (e) {
        console.log('Error disabling closing confirmation:', e);
      }
    };
  }, [enabled]);
}