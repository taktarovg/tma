// src/components/telegram/TelegramPopup.tsx - [new]
'use client';

import { useCallback, memo, ReactNode } from 'react';
import { getWebApp } from '@/lib/telegram-sdk';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TelegramAlertProps {
  title: string;
  description: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  children?: ReactNode;
}

const TelegramAlert = memo(function TelegramAlert({
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Отмена',
  destructive = false,
  children,
}: TelegramAlertProps) {
  const webApp = getWebApp();

  const showNativePopup = useCallback(async () => {
    // Если есть Telegram клиент, используем нативный popup
    if (webApp) {
      try {
        const result = await webApp.showPopup({
          message: description,
          title: title,
          buttons: [
            {
              id: 'cancel',
              type: 'cancel',
              text: cancelText,
            },
            {
              id: 'confirm',
              type: destructive ? 'destructive' : 'default',
              text: confirmText,
            },
          ],
        });
        
        if (result.button_id === 'confirm') {
          onConfirm();
        } else if (onCancel) {
          onCancel();
        }
        
        return true;
      } catch (error) {
        console.error('Failed to show Telegram popup:', error);
        return false;
      }
    }
    
    return false;
  }, [webApp, title, description, confirmText, cancelText, destructive, onConfirm, onCancel]);

  // Если дочерние элементы отсутствуют и это Telegram клиент, вызываем нативный popup
  if (!children && webApp) {
    showNativePopup();
    return null;
  }

  // Иначе используем AlertDialog из UI библиотеки
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {onCancel && (
            <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

export { TelegramAlert };