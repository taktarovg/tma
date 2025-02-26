// src/components/telegram/TelegramLayout.tsx
'use client';

import { useEffect, ReactNode, memo } from 'react';
import { getTelegramTheme, getWebApp, configureWebApp } from '@/lib/telegram-sdk';
import { cn } from '@/lib/utils';
import { useTelegramClient } from '@/components/TelegramClientProvider';

interface TelegramLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  withPadding?: boolean;
}

const TelegramLayout = memo(function TelegramLayout({
  children,
  header,
  footer,
  className,
  withPadding = true,
}: TelegramLayoutProps) {
  const { isInTelegram, webApp } = useTelegramClient();
  const theme = getTelegramTheme();
  
  // Определяем, является ли тема темной
  const isDarkMode = theme.backgroundColor.toLowerCase().startsWith('#0') || 
                      theme.backgroundColor.toLowerCase().startsWith('#1') || 
                      theme.backgroundColor.toLowerCase().startsWith('#2');

  // Автоматически расширяем приложение и настраиваем тему при монтировании
  useEffect(() => {
    if (isInTelegram && webApp) {
      webApp.expand();
      configureWebApp(); // Настраиваем внешний вид
    }
  }, [isInTelegram, webApp]);

  // Используем Dynamic HTML Colors для интеграции с Telegram
  const mainStyles = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
  };

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col',
        isDarkMode ? 'dark' : '',
        className
      )}
      style={mainStyles}
    >
      {header}
      <main
        className={cn(
          'flex-1',
          withPadding && 'p-4'
        )}
      >
        {children}
      </main>
      {footer}
    </div>
  );
});

// Компонент обертки для контента с отступами от краев экрана
const TelegramContainer = memo(function TelegramContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto max-w-[800px] w-full',
        className
      )}
    >
      {children}
    </div>
  );
});

export { TelegramLayout, TelegramContainer };