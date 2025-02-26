// src/lib/telegram-sdk.ts
'use client';

import { init } from '@telegram-apps/sdk';
import type { TelegramWebApp } from '../types/telegram';

// Singleton instance для Telegram WebApp
let telegramWebApp: TelegramWebApp | null = null;

/**
 * Инициализирует и возвращает экземпляр Telegram WebApp
 * @returns Экземпляр Telegram WebApp или null при ошибке
 */
export function getWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') {
    return null; // Безопасно для SSR
  }

  try {
    console.log('Initializing Telegram WebApp');
    console.log('Telegram global object:', typeof window.Telegram);
    console.log('WebApp object:', typeof window.Telegram?.WebApp);
    
    const hasWebView = typeof window.Telegram?.WebView !== 'undefined';
    console.log('Has WebView (desktop):', hasWebView);
    
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const tgWebAppDataFromSearch = searchParams.get('tgWebAppData');
    const tgWebAppDataFromHash = hashParams.get('tgWebAppData');
    const tgWebAppData = tgWebAppDataFromSearch || tgWebAppDataFromHash;
    console.log('tgWebAppData in URL (search or hash):', !!tgWebAppData);

    if (!telegramWebApp) {
      const initResult = init({
        debug: true,
        checksIntegrity: false,
      });

      // Проверяем, что initResult не undefined перед присвоением
      if (initResult) {
        telegramWebApp = initResult as TelegramWebApp;
      } else if (tgWebAppData) {
        console.log('No initData from SDK, parsing tgWebAppData manually');
        const decodedData = decodeURIComponent(tgWebAppData);
        const userMatch = decodedData.match(/user=([^&]+)/);
        if (userMatch) {
          const userJson = decodeURIComponent(userMatch[1]);
          const userData = JSON.parse(userJson);
          telegramWebApp = {
            initData: tgWebAppData,
            initDataUnsafe: { user: userData },
            themeParams: hashParams.has('tgWebAppThemeParams')
              ? JSON.parse(decodeURIComponent(hashParams.get('tgWebAppThemeParams')!))
              : {},
            ready: () => console.log('Manual WebApp ready'),
            close: () => window.close(),
            expand: () => console.log('Manual expand'),
            setHeaderColor: (color: string) => console.log('Manual setHeaderColor:', color),
            setBackgroundColor: (color: string) => console.log('Manual setBackgroundColor:', color),
            showPopup: (params: { message: string; buttons: Array<{ type: 'ok' | 'cancel'; text?: string }> }) => 
              Promise.resolve({ button_id: 'ok' }),
            BackButton: {
              hide: () => {},
            },
            MainButton: {
              hide: () => {},
            },
            hapticFeedback: {
              notificationOccurred: (type: string) => console.log('Haptic feedback:', type),
            },
          } as TelegramWebApp;
          console.log('Manually set initDataUnsafe:', telegramWebApp.initDataUnsafe);
        }
      }
    }

    return telegramWebApp;
  } catch (error) {
    console.warn('Failed to initialize Telegram WebApp:', error);
    return null;
  }
}

/**
 * Проверяет, запущено ли приложение в Telegram Mini App
 * @returns Boolean
 */
export function isTelegramMiniApp(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const webApp = getWebApp();
  if (!webApp) return false;
  
  const hasInitData = !!webApp.initData;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isTelegramUserAgent = userAgent.includes('TelegramWebApp') || userAgent.includes('Telegram');
  
  return hasInitData || isTelegramUserAgent;
}

/**
 * Получает тему из Telegram WebApp
 * @returns объект с параметрами темы
 */
export function getTelegramTheme() {
  if (typeof window === 'undefined') {
    return {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#2481cc',
      buttonTextColor: '#ffffff',
      hintColor: '#999999',
      secondaryBackgroundColor: '#f5f5f5',
    };
  }

  const webApp = getWebApp();
  return {
    backgroundColor: webApp?.themeParams?.bg_color || '#ffffff',
    textColor: webApp?.themeParams?.text_color || '#000000',
    buttonColor: webApp?.themeParams?.button_color || '#2481cc',
    buttonTextColor: webApp?.themeParams?.button_text_color || '#ffffff',
    hintColor: webApp?.themeParams?.hint_color || '#999999',
    secondaryBackgroundColor: webApp?.themeParams?.secondary_bg_color || '#f5f5f5',
  };
}

/**
 * Получает информацию о пользователе из Telegram WebApp
 * @returns объект с пользовательскими данными или null
 */
export function getTelegramUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const webApp = getWebApp();
  if (!webApp?.initDataUnsafe?.user) {
    return null;
  }

  const { user } = webApp.initDataUnsafe;
  return {
    telegramId: user.id.toString(),
    username: user.username || null,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    avatar: user.photo_url || null,
    isPremium: user.is_premium || false,
  };
}

/**
 * Настраивает внешний вид Telegram WebApp
 */
export function configureWebApp() {
  if (typeof window === 'undefined') {
    return;
  }

  const webApp = getWebApp();
  if (!webApp) return;

  try {
    if (webApp.setHeaderColor) webApp.setHeaderColor('secondary_bg_color');
    if (webApp.setBackgroundColor) webApp.setBackgroundColor('bg_color');
    if (webApp.expand) webApp.expand();

    if (webApp.BackButton) webApp.BackButton.hide();
    if (webApp.MainButton) webApp.MainButton.hide();
    
    if (webApp.hapticFeedback) webApp.hapticFeedback.notificationOccurred('success');
  } catch (error) {
    console.error('Failed to configure WebApp:', error);
  }
}

/**
 * Закрывает Telegram WebApp
 */
export function closeWebApp() {
  if (typeof window === 'undefined') {
    return;
  }

  const webApp = getWebApp();
  if (webApp) {
    webApp.close();
  }
}

/**
 * Показывает алерт в Telegram WebApp
 * @param message сообщение для отображения
 */
export async function showAlert(message: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const webApp = getWebApp();
  if (webApp && webApp.showPopup) {
    try {
      await webApp.showPopup({
        message,
        buttons: [{ type: 'ok' }],
      });
    } catch (error) {
      console.error('Failed to show alert:', error);
    }
  } else {
    alert(message); // Fallback
  }
}

/**
 * Показывает диалог подтверждения в Telegram WebApp
 * @param message сообщение для отображения
 * @returns true если пользователь подтвердил, false если отменил
 */
export async function showConfirm(message: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  const webApp = getWebApp();
  if (!webApp || !webApp.showPopup) return false;

  try {
    const result = await webApp.showPopup({
      message,
      buttons: [
        { type: 'cancel', text: 'Отмена' },
        { type: 'ok', text: 'Подтвердить' },
      ],
    });
    return result.button_id === 'ok';
  } catch (error) {
    console.error('Failed to show confirm:', error);
    return false;
  }
}