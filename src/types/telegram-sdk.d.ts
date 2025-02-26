// src/types/telegram-sdk.d.ts
import type { TelegramWebApp } from '../lib/telegram';

declare module '@telegram-apps/sdk' {
  interface InitOptions {
    debug?: boolean; // Добавляем debug как опциональную опцию
  }

  export function init(options?: InitOptions): TelegramWebApp;
}