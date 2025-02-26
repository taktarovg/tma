// src/components/services/CreateServiceForm.tsx - update
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CategorySelect } from './CategorySelect'
import { ImageUpload } from './ImageUpload'
import { CityDistrictSelect } from '../ui/CityDistrictSelect'
import { useToast } from '@/components/ui/use-toast'

interface CreateServiceFormProps {
  onSuccess?: () => void
}

interface FormData {
  name: string
  description: string
  price: number
  duration: number
  categoryId: string
  cityId: string
  districtId: string
  address: string
  image: string | null
}

export function CreateServiceForm({ onSuccess }: CreateServiceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    categoryId: '',
    cityId: '',
    districtId: '',
    address: '',
    image: null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Преобразуем строковые значения в числа
      const serviceData = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        categoryId: Number(formData.categoryId),
        cityId: Number(formData.cityId),
        districtId: Number(formData.districtId)
      }

      console.log('Sending service data:', serviceData)

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create service')
      }

      toast({
        title: 'Успешно',
        description: 'Услуга успешно создана'
      })

      if (onSuccess) {
        onSuccess()
      }

      router.push('/profile')
      router.refresh()
    } catch (error) {
      console.error('Error creating service:', error)
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать услугу',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <ImageUpload
          value={formData.image}
          onChange={(url) => setFormData({ ...formData, image: url })}
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Название услуги
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: Маникюр"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Описание
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Опишите услугу подробнее..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Категория
          </label>
          <CategorySelect
            value={formData.categoryId}
            onChange={(value) => setFormData({ ...formData, categoryId: value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Стоимость (₽)
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              min={0}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Длительность (мин)
            </label>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              min={15}
              step={15}
              required
            />
          </div>
        </div>

        <CityDistrictSelect
          selectedCityId={formData.cityId}
          selectedDistrictId={formData.districtId}
          onCityChange={(cityId) => setFormData({ ...formData, cityId, districtId: '' })}
          onDistrictChange={(districtId) => setFormData({ ...formData, districtId })}
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Адрес
          </label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Укажите адрес оказания услуги"
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
          {isLoading ? 'Создание...' : 'Создать услугу'}
        </Button>
      </div>
    </form>
  )
}