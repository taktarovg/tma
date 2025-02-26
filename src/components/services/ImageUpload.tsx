// src/components/services/ImageUpload.tsx - update
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return

    try {
      setIsLoading(true)
      const file = e.target.files[0]

      // Проверка размера файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Ошибка",
          description: "Размер файла не должен превышать 5MB",
          variant: "destructive"
        })
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'service')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const { url } = await response.json()
      onChange(url)

      toast({
        title: "Успешно",
        description: "Изображение загружено"
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображение",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className={cn(
        "flex flex-col items-center justify-center w-full aspect-square rounded-lg border-2 border-dashed",
        "transition-colors",
        isLoading && "opacity-50 cursor-not-allowed",
        !value && "hover:border-gray-400 border-gray-300"
      )}>
        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center h-full cursor-pointer">
            <Upload className={cn(
              "h-10 w-10",
              isLoading ? "text-gray-400" : "text-gray-500"
            )} />
            <span className="mt-2 text-sm text-gray-500">
              {isLoading ? 'Загрузка...' : 'Нажмите для загрузки'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={isLoading}
            />
          </label>
        )}
      </div>
    </div>
  )
}