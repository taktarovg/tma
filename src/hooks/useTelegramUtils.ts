// src/hooks/useTelegramUtils.ts - [new]
'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { getWebApp, getTelegramTheme } from '@/lib/telegram-sdk';
import type { TelegramThemeParams } from '@/types/telegram';

interface UseHapticFeedbackResult {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
    selectionChanged: () => void;
}

/**
 * Хук для работы с тактильной обратной связью в Telegram
 */
export function useHapticFeedback(): UseHapticFeedbackResult {
    const impactOccurred = useCallback((style: 'light' | 'medium' | 'heavy') => {
        try {
            const webApp = getWebApp();
            webApp?.hapticFeedback?.impactOccurred(style);
        } catch (err) {
            console.error('Haptic feedback error:', err);
        }
    }, []);

    const notificationOccurred = useCallback((type: 'success' | 'warning' | 'error') => {
        try {
            const webApp = getWebApp();
            webApp?.hapticFeedback?.notificationOccurred(type);
        } catch (err) {
            console.error('Haptic notification error:', err);
        }
    }, []);

    const selectionChanged = useCallback(() => {
        try {
            const webApp = getWebApp();
            webApp?.hapticFeedback?.selectionChanged();
        } catch (err) {
            console.error('Haptic selection error:', err);
        }
    }, []);

    return {
        impactOccurred,
        notificationOccurred,
        selectionChanged
    };
}

interface UseTelegramThemeResult {
    theme: TelegramThemeParams;
    isDarkMode: boolean;
    updateTheme: () => void;
}

/**
 * Хук для работы с темой Telegram
 */
export function useTelegramTheme(): UseTelegramThemeResult {
    const theme = getTelegramTheme();

    const isDarkMode = useMemo(() => {
        const bgColor = theme.backgroundColor.toLowerCase();
        return bgColor.startsWith('#0') || bgColor.startsWith('#1') || bgColor.startsWith('#2');
    }, [theme.backgroundColor]);

    const updateTheme = useCallback(() => {
        try {
            const webApp = getWebApp();

            if (webApp) {
                webApp.setHeaderColor('secondary_bg_color');
                webApp.setBackgroundColor(isDarkMode ? '#1f1f1f' : '#ffffff');
            }
        } catch (err) {
            console.error('Theme update error:', err);
        }
    }, [isDarkMode]);

    useEffect(() => {
        updateTheme();
    }, [updateTheme]);

    return {
        theme,
        isDarkMode,
        updateTheme
    };
}

interface UseWebAppPopupResult {
    showAlert: (message: string) => Promise<void>;
    showConfirm: (message: string) => Promise<boolean>;
    showPopup: (params: {
        message: string;
        title?: string;
        buttons?: Array<{
            id?: string;
            type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
        }>;
    }) => Promise<{ button_id: string | null }>;
}

/**
 * Хук для работы со всплывающими окнами Telegram
 */
export function useTelegramPopup(): UseWebAppPopupResult {
    const showAlert = useCallback(async (message: string) => {
        const webApp = getWebApp();
        if (!webApp) return;

        try {
            await webApp.showPopup({
                message,
                buttons: [{ type: 'ok' }]
            });
        } catch (err) {
            console.error('Show alert error:', err);
        }
    }, []);

    const showConfirm = useCallback(async (message: string): Promise<boolean> => {
        const webApp = getWebApp();
        if (!webApp) return false;

        try {
            const result = await webApp.showPopup({
                message,
                buttons: [
                    { type: 'cancel', text: 'Отмена' },
                    { type: 'ok', text: 'Подтвердить' }
                ]
            });

            return result.button_id === 'ok';
        } catch (err) {
            console.error('Show confirm error:', err);
            return false;
        }
    }, []);

    const showPopup = useCallback(async (params: {
        message: string;
        title?: string;
        buttons?: Array<{
            id?: string;
            type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
        }>;
    }): Promise<{ button_id: string | null }> => {
        const webApp = getWebApp();
        if (!webApp) {
            console.error('WebApp is not initialized');
            return { button_id: null };
        }

        try {
            return await webApp.showPopup(params);
        } catch (err) {
            console.error('Show popup error:', err);
            return { button_id: null };
        }
    }, []);

    return {
        showAlert,
        showConfirm,
        showPopup
    };
}

interface UseWebAppViewportResult {
    isExpanded: boolean;
    viewportHeight: number;
    expand: () => void;
}

/**
 * Хук для работы с видимой областью WebApp
 */
export function useWebAppViewport(): UseWebAppViewportResult {
    const [isExpanded, setIsExpanded] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(0);

    useEffect(() => {
        const webApp = getWebApp();
        if (!webApp) return;

        // Инициализация начальных значений
        setIsExpanded(webApp.isExpanded);
        setViewportHeight(webApp.viewportHeight || 0);

        // Обработчик изменения видимой области
        const handleViewportChanged = () => {
            if (webApp) {
                setIsExpanded(webApp.isExpanded);
                setViewportHeight(webApp.viewportHeight || 0);
            }
        };

        // Добавляем обработчик если метод доступен
        if (webApp.onEvent) {
            webApp.onEvent('viewportChanged', handleViewportChanged);

            return () => {
                webApp.offEvent('viewportChanged', handleViewportChanged);
            };
        }

        return undefined;
    }, []);

    const expand = useCallback(() => {
        try {
            const webApp = getWebApp();
            webApp?.expand();
            setIsExpanded(true);
        } catch (err) {
            console.error('Expand error:', err);
        }
    }, []);

    return {
        isExpanded,
        viewportHeight,
        expand
    };
}

/**
 * Хук для предотвращения случайного закрытия приложения
 */
export function useClosingConfirmation(enabled: boolean = true) {
    useEffect(() => {
        const webApp = getWebApp();

        if (webApp) {
            if (enabled) {
                webApp.enableClosingConfirmation?.();
            } else {
                webApp.disableClosingConfirmation?.();
            }
        }

        return () => {
            webApp?.disableClosingConfirmation?.();
        };
    }, [enabled]);
}