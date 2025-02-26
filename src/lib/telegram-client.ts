// src/lib/telegram-client.ts
'use client'; // Добавляем директиву для изоляции клиентского кода

import { getWebApp } from './telegram-sdk'; // Импортируем функцию getWebApp

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      premium?: boolean;
    };
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    hint_color?: string;
  };
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  expand(): void;
  hapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
  };
  BackButton?: {
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  MainButton?: {
    setText(text: string): void;
    setParams(params: { color: string; text_color: string }): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    showProgress(): void;
    hideProgress(): void;
  };
  close(): void;
  showPopup(params: { message: string; buttons: { type: string }[] }): Promise<void>;
}

export function isTelegramMiniApp(): boolean {
  const webApp = getWebApp();
  return typeof window !== 'undefined' && !!webApp?.initData;
}

export function getTelegramThemeParams() {
  const webApp = getWebApp();
  if (!isTelegramMiniApp()) {
    return {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#2481cc',
      buttonTextColor: '#ffffff',
    };
  }

  const { bg_color, text_color, button_color, button_text_color } = webApp.themeParams;
  return {
    backgroundColor: bg_color || '#ffffff',
    textColor: text_color || '#000000',
    buttonColor: button_color || '#2481cc',
    buttonTextColor: button_text_color || '#ffffff',
  };
}

export function configureWebApp() {
  const webApp = getWebApp();
  if (!isTelegramMiniApp()) return;

  try {
    webApp.setHeaderColor('secondary_bg_color');
    webApp.setBackgroundColor('bg_color');
    webApp.expand();
    webApp.hapticFeedback.impactOccurred('light');
    if (webApp.BackButton) {
      webApp.BackButton.show();
    }
  } catch (error) {
    console.error('Failed to configure WebApp:', error);
  }
}

export function getTelegramUser() {
  const webApp = getWebApp();
  if (!isTelegramMiniApp() || !webApp?.initDataUnsafe?.user) {
    return null;
  }

  const { user } = webApp.initDataUnsafe;
  return {
    telegramId: user.id.toString(),
    username: user.username || null,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    avatar: user.photo_url || null,
    isPremium: user.premium || false,
  };
}

export function handleTelegramClick(callback: () => void) {
  const webApp = getWebApp();
  if (isTelegramMiniApp()) {
    webApp.hapticFeedback.impactOccurred('light');
  }
  callback();
}

export function closeTelegramWebApp() {
  const webApp = getWebApp();
  if (isTelegramMiniApp()) {
    webApp.close();
  }
}

export function showTelegramAlert(message: string, callback?: () => void) {
  const webApp = getWebApp();
  if (isTelegramMiniApp()) {
    webApp.showPopup({
      message,
      buttons: [{ type: 'ok' }],
    }).then(callback);
  }
}