// src/components/telegram/TelegramHeader.tsx - [new]
'use client';

import { memo, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useWebAppBackButton } from '@/hooks/useWebAppBackButton';
import { getTelegramTheme } from '@/lib/telegram-sdk';
import { cn } from '@/lib/utils';
import { ChevronLeft, Menu } from 'lucide-react';

interface TelegramHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightContent?: ReactNode;
  className?: string;
  leftContent?: ReactNode;
  transparent?: boolean;
  sticky?: boolean;
}

const TelegramHeader = memo(function TelegramHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackClick,
  rightContent,
  className,
  leftContent,
  transparent = false,
  sticky = true,
}: TelegramHeaderProps) {
  const router = useRouter();
  const theme = getTelegramTheme();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  // Интеграция с Telegram BackButton
  const { isReady: isBackButtonReady } = useWebAppBackButton({
    enabled: showBackButton,
    onBack: handleBack,
  });

  return (
    <header
      className={cn(
        'relative z-10 h-14 py-2 px-4',
        !transparent && 'bg-background',
        sticky && 'sticky top-0',
        showBackButton && 'pl-12',
        className
      )}
      style={{
        backgroundColor: transparent ? 'transparent' : theme.secondaryBackgroundColor,
        color: theme.textColor,
      }}
    >
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && !isBackButtonReady && (
            <button
              onClick={handleBack}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-foreground/70 hover:bg-foreground/10 active:bg-foreground/20"
              aria-label="Назад"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {leftContent}
          <div className="flex flex-col">
            <h1 className="text-base font-medium leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-xs text-foreground/60">{subtitle}</p>
            )}
          </div>
        </div>
        {rightContent && (
          <div className="flex items-center">{rightContent}</div>
        )}
      </div>
    </header>
  );
});

interface TelegramHeaderButtonProps {
  icon: ReactNode;
  onClick: () => void;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

const TelegramHeaderButton = memo(function TelegramHeaderButton({
  icon,
  onClick,
  label,
  active = false,
  disabled = false,
  className,
}: TelegramHeaderButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center rounded-full p-2 text-foreground/70',
        'hover:bg-foreground/10 active:bg-foreground/20',
        'transition-colors duration-200',
        active && 'bg-foreground/10 text-foreground',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
});

const TelegramMenuButton = memo(function TelegramMenuButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <TelegramHeaderButton
      icon={<Menu className="h-5 w-5" />}
      onClick={onClick}
      label="Меню"
      className={className}
    />
  );
});

export { TelegramHeader, TelegramHeaderButton, TelegramMenuButton };