// src/components/profile/ImageUpload.tsx - update
'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ImageUploadProps {
  variant: 'avatar' | 'service'
  value: string | null
  onChange: (url: string) => void
}

export function ImageUpload({ variant, value, onChange }: ImageUploadProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return

    try {
      setIsLoading(true)
      const file = e.target.files[0]

      // Проверяем размер файла (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Файл слишком большой. Максимальный размер 10MB',
          variant: 'destructive',
        })
        return
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Ошибка',
          description: 'Можно загружать только изображения',
          variant: 'destructive',
        })
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', variant)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка загрузки')
      }

      const { url } = await response.json()
      onChange(url)
      
      toast({
        title: 'Успешно',
        description: 'Изображение загружено',
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить изображение',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <label className={`
      absolute bottom-0 right-0 p-1.5 
      rounded-full bg-primary text-white cursor-pointer
      hover:bg-primary/90 transition-colors
      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      <Camera className="h-4 w-4" />
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
        disabled={isLoading}
      />
    </label>
  )
}