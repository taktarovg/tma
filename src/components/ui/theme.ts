// src/components/ui/theme.ts
import { WebApp } from '@/lib/telegram-sdk';

export function useAppTheme() {
  const themeParams = WebApp.themeParams;

  return {
    backgroundColor: themeParams?.bg_color || '#ffffff',
    textColor: themeParams?.text_color || '#000000',
    buttonColor: themeParams?.button_color || '#2481cc',
    buttonTextColor: themeParams?.button_text_color || '#ffffff',
    secondaryBackgroundColor: themeParams?.secondary_bg_color || '#f5f5f5',
    hintColor: themeParams?.hint_color || '#999999',
  };
}