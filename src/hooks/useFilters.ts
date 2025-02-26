// src/hooks/useFilters.ts
'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      // Проверяем searchParams на null, используя пустую строку как значение по умолчанию
      const params = new URLSearchParams(searchParams?.toString() || '');

      // Если меняется город, сбрасываем район в том же обновлении
      if (key === 'city') {
        if (value) {
          params.set(key, value);
          params.delete('district'); // сбрасываем район
        } else {
          params.delete(key);
          params.delete('district'); // сбрасываем район
        }
      } else {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push('/', { scroll: false });
  }, [router]);

  return {
    updateFilter,
    clearFilters,
    filters: {
      city: searchParams?.get('city') || '',
      district: searchParams?.get('district') || '',
      category: searchParams?.get('category') || '',
    },
  };
}