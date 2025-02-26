// src/hooks/useWebAppMainButton.ts
'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { getWebApp } from '@/lib/telegram-sdk';
import type { TelegramWebApp } from '@/types/telegram';

interface UseMainButtonOptions {
  text: string;
  color?: string;
  textColor?: string;
  onClick: () => void | Promise<void>;
  isActive?: boolean;
  isVisible?: boolean;
  loadingText?: string;
}

interface UseMainButtonResult {
  isReady: boolean;
  isLoading: boolean;
  setText: (text: string) => void;
  setLoading: (loading: boolean) => void;
  show: () => void;
  hide: () => void;
  error: Error | null;
}

export function useWebAppMainButton({
  text,
  color = '#2481cc',
  textColor = '#ffffff',
  onClick,
  isActive = true,
  isVisible = true,
  loadingText = 'Загрузка...'
}: UseMainButtonOptions): UseMainButtonResult {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const originalText = useRef(text);
  const mainButtonRef = useRef<TelegramWebApp['MainButton'] | null>(null);

  // Инициализация кнопки
  useEffect(() => {
    try {
      const webApp = getWebApp();

      if (!webApp?.MainButton) {
        console.log('MainButton is not available in this environment');
        return;
      }

      mainButtonRef.current = webApp.MainButton;
      setIsReady(true);
    } catch (err) {
      console.error('MainButton initialization error:', err);
      setError(err instanceof Error ? err : new Error('Ошибка инициализации MainButton'));
      setIsReady(false);
    }
  }, []);

  // Настройка кнопки при изменении пропсов
  useEffect(() => {
    const mainButton = mainButtonRef.current;
    if (!mainButton || !isReady) return;

    try {
      mainButton.setText(text);
      mainButton.setParams({
        color,
        text_color: textColor,
      });

      if (isVisible) {
        mainButton.show();
      } else {
        mainButton.hide();
      }

      if (isActive) {
        mainButton.enable();
      } else {
        mainButton.disable();
      }
    } catch (err) {
      console.error('Error configuring MainButton:', err);
      setError(err instanceof Error ? err : new Error('Ошибка настройки MainButton'));
    }
  }, [text, color, textColor, isVisible, isActive, isReady]);

  // Обработчик клика с поддержкой асинхронных операций
  const handleClick = useCallback(async () => {
    const mainButton = mainButtonRef.current;
    if (!mainButton || isLoading) return;

    try {
      setIsLoading(true);
      
      // Пытаемся показать прогресс и изменить текст
      try {
        mainButton.showProgress();
        mainButton.setText(loadingText);
        mainButton.disable();
      } catch (e) {
        console.log('Error showing progress:', e);
        // Продолжаем выполнение даже если не удалось показать прогресс
      }

      await onClick();
    } catch (err) {
      console.error('MainButton click error:', err);
      setError(err instanceof Error ? err : new Error('Ошибка при выполнении действия'));
    } finally {
      if (mainButton) {
        try {
          mainButton.hideProgress();
          mainButton.setText(originalText.current);
          if (isActive) mainButton.enable();
        } catch (e) {
          console.log('Error hiding progress:', e);
        }
      }
      setIsLoading(false);
    }
  }, [onClick, isLoading, isActive, loadingText]);

  // Привязка обработчика клика
  useEffect(() => {
    const mainButton = mainButtonRef.current;
    if (!mainButton || !isReady) return;

    try {
      mainButton.onClick(handleClick);
    } catch (e) {
      console.log('Error setting onClick handler:', e);
    }

    return () => {
      try {
        if (mainButton) {
          mainButton.offClick(handleClick);
        }
      } catch (e) {
        console.log('Error removing onClick handler:', e);
      }
    };
  }, [handleClick, isReady]);

  // Методы для внешнего управления кнопкой
  const setText = useCallback((newText: string) => {
    const mainButton = mainButtonRef.current;
    if (!mainButton || !isReady) return;

    originalText.current = newText;

    if (!isLoading) {
      try {
        mainButton.setText(newText);
      } catch (e) {
        console.log('Error setting text:', e);
      }
    }
  }, [isReady, isLoading]);

  const show = useCallback(() => {
    try {
      mainButtonRef.current?.show();
    } catch (e) {
      console.log('Error showing MainButton:', e);
    }
  }, []);

  const hide = useCallback(() => {
    try {
      mainButtonRef.current?.hide();
    } catch (e) {
      console.log('Error hiding MainButton:', e);
    }
  }, []);

  const setLoadingState = useCallback((loading: boolean) => {
    const mainButton = mainButtonRef.current;
    if (!mainButton || !isReady) return;

    setIsLoading(loading);

    try {
      if (loading) {
        mainButton.showProgress();
        mainButton.setText(loadingText);
        mainButton.disable();
      } else {
        mainButton.hideProgress();
        mainButton.setText(originalText.current);
        if (isActive) mainButton.enable();
      }
    } catch (e) {
      console.log('Error setting loading state:', e);
    }
  }, [isReady, isActive, loadingText]);

  return {
    isReady,
    isLoading,
    setText,
    setLoading: setLoadingState,
    show,
    hide,
    error
  };
}