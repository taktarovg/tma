// src/app/(protected)/profile/edit/page.tsx - update
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/Avatar'
import { ImageUpload } from '@/components/profile/ImageUpload'
import { CityDistrictSelect } from '@/components/ui/CityDistrictSelect'
import { useToast } from '@/components/ui/use-toast'

export default function EditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    cityId?: string;
    districtId?: string;
    avatar: string | null;
  } | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setUserData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            cityId: data.cityId?.toString(),
            districtId: data.districtId?.toString(),
            avatar: data.avatar
          })
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные профиля"
        })
      }
    }

    fetchUserData()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast({
        title: "Успешно",
        description: "Профиль обновлен"
      })

      router.push('/profile')
      router.refresh()
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить профиль"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!userData) {
    return (
      <div className="container max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-20 animate-pulse bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Аватар */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar 
                src={userData.avatar || undefined}
                alt="Аватар профиля"
                size="lg"
                fallback={userData.firstName?.[0] || '?'}
                className="w-24 h-24"
              />
              <ImageUpload
                variant="avatar"
                value={userData.avatar}
                onChange={(url) => setUserData(prev => prev ? {...prev, avatar: url} : null)}
              />
            </div>
          </div>

          {/* Основная информация */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="firstName">
                Имя
              </label>
              <Input
                id="firstName"
                value={userData.firstName}
                onChange={(e) => setUserData(prev => prev ? {...prev, firstName: e.target.value} : null)}
                placeholder="Введите имя"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="lastName">
                Фамилия
              </label>
              <Input
                id="lastName"
                value={userData.lastName}
                onChange={(e) => setUserData(prev => prev ? {...prev, lastName: e.target.value} : null)}
                placeholder="Введите фамилию"
              />
            </div>

            <CityDistrictSelect
              selectedCityId={userData.cityId}
              selectedDistrictId={userData.districtId}
              onCityChange={(cityId) => setUserData(prev => prev ? {...prev, cityId, districtId: undefined} : null)}
              onDistrictChange={(districtId) => setUserData(prev => prev ? {...prev, districtId} : null)}
            />
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  )
}