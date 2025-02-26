// src/lib/profile-redirect.ts
'use client';

/**
 * Функция для принудительного перенаправления на страницу профиля.
 * Использует несколько механизмов для обеспечения надежного перенаправления.
 * 
 * @param options Опции перенаправления
 */
export function redirectToProfile(options: {
    delay?: number;
    useWindowLocation?: boolean;
    fallbackPath?: string;
} = {}) {
    const {
        delay = 300,
        useWindowLocation = true,
        fallbackPath = '/profile'
    } = options;

    console.log('Initiating profile redirect');

    // Установка метатегов для перенаправления (работает даже при блокировке JavaScript)
    try {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'refresh';
        meta.content = `0;url=${fallbackPath}`;
        document.head.appendChild(meta);
    } catch (e) {
        console.log('Meta redirect error:', e);
    }

    // Использование location.assign (более надежный способ перенаправления)
    if (useWindowLocation) {
        setTimeout(() => {
            try {
                console.log('Redirecting via window.location');
                window.location.href = fallbackPath;
            } catch (e) {
                console.log('Window location redirect error:', e);
                // Если не сработало, пробуем другие способы
                try {
                    window.location.pathname = fallbackPath;
                } catch (err) {
                    console.log('Pathname redirect error:', err);
                }
            }
        }, delay);
    }

    // Вспомогательная функция для перенаправления через Next.js Router
    // (будет использована компонентами, у которых есть доступ к router)
    return {
        // Возвращаем флаг, что перенаправление было инициировано
        redirectInitiated: true,
        // В случае, если хотим использовать router.push из компонента
        path: fallbackPath
    };
}

/**
 * Функция для проверки, требуется ли редирект на профиль.
 * Полезна для предотвращения циклических редиректов.
 */
export function shouldRedirectToProfile(user: any): boolean {
    if (!user) return false;

    // Проверяем URL - если уже на странице профиля, не нужно перенаправлять
    if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/profile')) {
            return false;
        }
        // Если на корневой странице, но есть пользователь, то нужно перенаправить
        if (currentPath === '/' && user) {
            return true;
        }
    }

    return !!user;
}