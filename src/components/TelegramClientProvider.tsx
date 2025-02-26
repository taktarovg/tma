// src/components/TelegramClientProvider.tsx
'use client';

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { init, WebApp } from '@telegram-apps/sdk';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface TelegramClientContextType {
  isReady: boolean;
  isInTelegram: boolean;
  webApp: typeof WebApp | null;
  user: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
    isPremium?: boolean;
    languageCode?: string;
  } | null;
  error: string | null;
}

const TelegramClientContext = createContext<TelegramClientContextType | undefined>(undefined);

export function useTelegramClient() {
  const context = useContext(TelegramClientContext);
  if (context === undefined) {
    throw new Error('useTelegramClient must be used within a TelegramClientProvider');
  }
  return context;
}

export function TelegramClientProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState<{
    isReady: boolean;
    isInTelegram: boolean;
    webApp: typeof WebApp | null;
    user: TelegramClientContextType['user'];
    error: string | null;
  }>({
    isReady: false,
    isInTelegram: false,
    webApp: null,
    user: null,
    error: null,
  });

  const initialize = useCallback(async () => {
    if (state.isReady) return;

    try {
      console.log('Attempting to initialize Telegram SDK...');
      console.log('Window object available:', typeof window !== 'undefined');
      console.log('Window Telegram object:', typeof window !== 'undefined' ? window.Telegram : 'undefined');
      
      console.log('Window location:', window.location.href);
      console.log('Current URL search params:', window.location.search);
      console.log('Current URL hash:', window.location.hash);

      const webAppInstance = init({
        debug: process.env.NODE_ENV === 'development',
        checksIntegrity: false,
      });

      console.log('WebApp initialization result:', !!webAppInstance);
      console.log('WebApp initData available:', !!webAppInstance?.initData);
      console.log('WebApp initDataUnsafe:', JSON.stringify(webAppInstance?.initDataUnsafe || {}));

      let userData = webAppInstance?.initDataUnsafe?.user;

      if (!userData && window.location.hash) {
        // Пытаемся извлечь данные пользователя из хеша URL
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const tgWebAppData = hashParams.get('tgWebAppData');
        if (tgWebAppData) {
          const decodedData = decodeURIComponent(tgWebAppData);
          const userMatch = decodedData.match(/user=([^&]+)/);
          if (userMatch) {
            try {
              const userJson = decodeURIComponent(userMatch[1]);
              userData = JSON.parse(userJson);
              console.log('User data parsed from hash:', userData);
            } catch (e) {
              console.error('Error parsing user data from hash:', e);
            }
          }
        }
      }

      // Проверка на Telegram Desktop и другие платформы
      if (!userData && typeof window.Telegram !== 'undefined' && window.Telegram.WebView) {
        try {
          console.log('Attempting to use Telegram WebView API');
          // Может понадобиться специфичная логика для WebView
          const webViewData = window.Telegram.WebView.initData || '';
          if (webViewData) {
            const params = new URLSearchParams(webViewData);
            const userParam = params.get('user');
            if (userParam) {
              userData = JSON.parse(decodeURIComponent(userParam));
              console.log('User data parsed from WebView:', userData);
            }
          }
        } catch (e) {
          console.error('Error getting data from WebView:', e);
        }
      }

      if (webAppInstance && (webAppInstance.initData || userData)) {
        setState(prev => ({
          ...prev,
          webApp: webAppInstance,
          isInTelegram: true,
          user: userData ? {
            id: userData.id,
            firstName: userData.first_name,
            lastName: userData.last_name,
            username: userData.username,
            photoUrl: userData.photo_url,
            isPremium: userData.is_premium,
            languageCode: userData.language_code,
          } : null,
        }));

        if (webAppInstance.setHeaderColor) webAppInstance.setHeaderColor('secondary_bg_color');
        if (webAppInstance.setBackgroundColor) webAppInstance.setBackgroundColor('bg_color');
        if (webAppInstance.expand) webAppInstance.expand();

        await checkServerConnection();
      } else {
        setState(prev => ({
          ...prev,
          error: 'Приложение должно быть открыто в Telegram',
        }));
      }

      setState(prev => ({
        ...prev,
        isReady: true,
      }));
    } catch (err) {
      console.error('Telegram SDK initialization error:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Ошибка инициализации Telegram SDK',
        isReady: true,
      }));
    }
  }, [router, toast]); // Убедились, что зависимости минимальны

  useEffect(() => {
    initialize();
  }, [initialize]);

  const checkServerConnection = async () => {
    try {
      const response = await fetch('/api/auth/telegram/check', {
        method: 'GET',
        headers: {
          'X-Telegram-Mini-App': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Server check response:', data);
    } catch (err) {
      console.error('Server connection error:', err);
      toast({
        title: 'Предупреждение',
        description: 'Проблемы с подключением к серверу. Некоторые функции могут быть недоступны.',
        variant: 'destructive',
      });
    }
  };

  const value = {
    isReady: state.isReady,
    isInTelegram: state.isInTelegram,
    webApp: state.webApp,
    user: state.user,
    error: state.error,
  };

  return (
    <TelegramClientContext.Provider value={value}>
      {children}
    </TelegramClientContext.Provider>
  );
}