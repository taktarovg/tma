// src/components/services/ServiceFilters.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface District {
  id: string;
  name: string;
  cityId: string;
}

export function ServiceFilters({ districts }: { districts: District[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Исправленные строки с проверкой на null через ?.
  const [selectedCity, setSelectedCity] = useState(searchParams?.get('city') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams?.get('district') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || '');

  const filteredDistricts = districts.filter(
    district => district.cityId === selectedCity
  );

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      {/* Пример UI для фильтров */}
      <select
        value={selectedCity}
        onChange={(e) => {
          setSelectedCity(e.target.value);
          updateFilters('city', e.target.value);
        }}
      >
        <option value="">Выберите город</option>
        {/* Предполагаемые города */}
        <option value="1">Москва</option>
        <option value="2">Санкт-Петербург</option>
      </select>

      <select
        value={selectedDistrict}
        onChange={(e) => {
          setSelectedDistrict(e.target.value);
          updateFilters('district', e.target.value);
        }}
      >
        <option value="">Выберите район</option>
        {filteredDistricts.map(district => (
          <option key={district.id} value={district.id}>
            {district.name}
          </option>
        ))}
      </select>

      <select
        value={selectedCategory}
        onChange={(e) => {
          setSelectedCategory(e.target.value);
          updateFilters('category', e.target.value);
        }}
      >
        <option value="">Выберите категорию</option>
        {/* Предполагаемые категории */}
        <option value="hair">Волосы</option>
        <option value="nails">Ногти</option>
      </select>
    </div>
  );
}