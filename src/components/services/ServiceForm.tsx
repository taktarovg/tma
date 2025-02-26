// src/components/services/ServiceForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, City, District, Service } from '@prisma/client';

interface ServiceFormProps {
  initialData?: Service;
  categories: Category[];
  cities: City[];
  districts: District[];
}

export function ServiceForm({ initialData, categories, cities, districts }: ServiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    duration: initialData?.duration || 60,
    categoryId: initialData?.categoryId || '',
    cityId: '',
    districtId: '',
    address: '',
  });

  const [selectedCity, setSelectedCity] = useState(formData.cityId);

  const filteredDistricts = districts.filter(
    district => formData.cityId ? district.cityId === parseInt(formData.cityId) : false
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = initialData 
        ? `/api/services/${initialData.id}`
        : '/api/services';
      
      const method = initialData ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save service');
      }

      router.push('/profile');
      router.refresh();
    } catch (error) {
      console.error('Service save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Название услуги
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: Аппаратный маникюр"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Описание услуги
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Опишите подробности услуги..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Стоимость (₽)
            </label>
            <Input
              type="number"
              value={formData.price.toString()}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
              min={0}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Длительность (мин)
            </label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите длительность" />
              </SelectTrigger>
              <SelectContent>
                {[30, 60, 90, 120, 150, 180].map((duration) => (
                  <SelectItem key={duration} value={duration.toString()}>
                    {duration} минут
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Категория
          </label>
          <Select
            value={formData.categoryId.toString()}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Город
            </label>
            <Select
              value={formData.cityId}
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  cityId: value,
                  districtId: '', // Сбрасываем район при смене города
                });
                setSelectedCity(value); // Синхронизируем selectedCity
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Район
            </label>
            <Select
              value={formData.districtId}
              onValueChange={(value) => setFormData({ ...formData, districtId: value })}
              disabled={!formData.cityId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите район" />
              </SelectTrigger>
              <SelectContent>
                {filteredDistricts.map((district) => (
                  <SelectItem key={district.id} value={district.id.toString()}> {/* Преобразуем в строку */}
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Адрес
          </label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Улица, дом, офис"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : initialData ? 'Сохранить изменения' : 'Создать услугу'}
        </Button>
      </div>
    </form>
  );
}