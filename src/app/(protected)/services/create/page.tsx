// src/app/(protected)/services/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { ImageUpload } from '@/components/services/ImageUpload'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CategorySelect } from '@/components/services/CategorySelect'
import { CityDistrictSelect } from '@/components/ui/CityDistrictSelect'

interface ServiceFormData {
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

export default function CreateServicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ServiceFormData>({
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
      // Проверка заполнения обязательных полей
      if (!formData.cityId || !formData.districtId || !formData.categoryId) {
        toast({
          title: 'Ошибка',
          description: 'Пожалуйста, заполните все обязательные поля',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create service')
      }

      toast({
        title: 'Успешно',
        description: 'Услуга создана. Вы будете перенаправлены в профиль',
      })

      router.push('/profile')
      router.refresh()
    } catch (error) {
      console.error('Service creation error:', error)
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать услугу',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Добавление услуги</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <ImageUpload
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
          />
        </div>

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

          <CityDistrictSelect
            selectedCityId={formData.cityId}
            selectedDistrictId={formData.districtId}
            onCityChange={(cityId) => setFormData({ ...formData, cityId, districtId: '' })}
            onDistrictChange={(districtId) => setFormData({ ...formData, districtId })}
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              Адрес оказания услуги
            </label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Улица, дом, офис"
              required
            />
          </div>
        </div>

        <Alert>
          <AlertDescription>
            После создания услуги вы автоматически получите статус мастера
          </AlertDescription>
        </Alert>

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
    </div>
  )
}