// src/lib/redirects.ts
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Хук для безопасного перенаправления в Next.js приложении
 * @param path Путь для перенаправления
 * @param condition Условие, при котором произойдет перенаправление (по умолчанию true)
 * @param options Дополнительные опции
 */
export function useRedirect(
  path: string, 
  condition: boolean = true, 
  options: { 
    delay?: number; // Задержка перед перенаправлением
    force?: boolean; // Принудительное перенаправление через window.location
    replace?: boolean; // Использовать replace вместо push
  } = {}
) {
  const { delay = 0, force = false, replace = false } = options;
  const router = useRouter();

  useEffect(() => {
    if (!condition) return;

    let timeoutId: NodeJS.Timeout;

    if (delay > 0) {
      timeoutId = setTimeout(() => {
        if (force) {
          window.location.href = path;
        } else {
          replace ? router.replace(path) : router.push(path);
        }
      }, delay);
    } else {
      if (force) {
        window.location.href = path;
      } else {
        replace ? router.replace(path) : router.push(path);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [path, condition, delay, force, replace, router]);
}

/**
 * Функция для клиентского перенаправления без хука
 * @param path Путь для перенаправления 
 * @param options Дополнительные опции
 */
export function redirectClient(
  path: string,
  options: {
    delay?: number;
    force?: boolean;
  } = {}
) {
  const { delay = 0, force = false } = options;

  if (delay > 0) {
    setTimeout(() => {
      if (force) {
        window.location.href = path;
      } else {
        window.location.pathname = path;
      }
    }, delay);
  } else {
    if (force) {
      window.location.href = path;
    } else {
      window.location.pathname = path;
    }
  }
}