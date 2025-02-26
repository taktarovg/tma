// src/components/telegram/TelegramActionButton.tsx - [new]
'use client';

import { useEffect, useCallback, memo } from 'react';
import { useWebAppMainButton } from '@/hooks/useWebAppMainButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TelegramActionButtonProps {
  text: string;
  onClick: () => void | Promise<void>;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  showFallback?: boolean;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const TelegramActionButton = memo(function TelegramActionButton({
  text,
  onClick,
  color,
  textColor,
  disabled = false,
  loading = false,
  loadingText = 'Загрузка...',
  className,
  showFallback = true,
  size = 'default',
  variant = 'default'
}: TelegramActionButtonProps) {
  const {
    isReady: isMainButtonReady,
    setLoading: setMainButtonLoading,
    error: mainButtonError
  } = useWebAppMainButton({
    text,
    color,
    textColor,
    onClick: async () => {
      await onClick();
    },
    isActive: !disabled,
    isVisible: true,
    loadingText
  });

  // Синхронизация состояния загрузки
  useEffect(() => {
    setMainButtonLoading(loading);
  }, [loading, setMainButtonLoading]);

  // Обработчик для fallback кнопки
  const handleFallbackClick = useCallback(async () => {
    if (disabled || loading) return;
    
    try {
      await onClick();
    } catch (error) {
      console.error('Action button error:', error);
    }
  }, [onClick, disabled, loading]);

  // Если MainButton доступен и нет ошибок, не показываем fallback
  if (isMainButtonReady && !mainButtonError && !showFallback) {
    return null;
  }

  // Fallback кнопка для веб-версии или при ошибках с MainButton
  return (
    <Button
      onClick={handleFallbackClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={cn(
        'relative w-full transition-all duration-200',
        loading && 'opacity-80',
        className
      )}
      style={{
        backgroundColor: variant === 'default' ? color : undefined,
        color: variant === 'default' ? textColor : undefined,
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>{loadingText}</span>
        </div>
      ) : (
        text
      )}
    </Button>
  );
});

// Компонент-контейнер для действий
export const TelegramActionContainer = memo(function TelegramActionContainer({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm',
        'border-t p-4 shadow-lg',
        'flex flex-col gap-2',
        className
      )}
    >
      {children}
    </div>
  );
});

export { TelegramActionButton };