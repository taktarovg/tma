// src/components/services/CategorySelect.tsx - update
'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
    id: number
    name: string
    slug: string
    order: number
    parentId: number | null
    children?: Category[]
}

interface CategorySelectProps {
    value: string
    onChange: (value: string) => void
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories')
                if (!response.ok) {
                    throw new Error('Failed to fetch categories')
                }
                const data = await response.json()
                console.log('Fetched categories:', data)
                setCategories(data)
            } catch (error) {
                console.error('Error fetching categories:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [])

    if (loading) {
        return (
            <Select disabled>
                <SelectTrigger className="px-4 py-2 rounded-full text-sm border border-gray-200">
                    <SelectValue placeholder="Загрузка..." />
                </SelectTrigger>
            </Select>
        )
    }

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <SelectValue placeholder="Выберите..." />
            </SelectTrigger>
            <SelectContent>
                {categories.map((parentCategory) => (
                    <SelectGroup key={parentCategory.id}>
                        <SelectLabel
                            className="px-2 py-1.5 font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                        >
                            {parentCategory.name}
                        </SelectLabel>
                        {/* Отображаем только дочерние категории */}
                        {parentCategory.children?.map((child) => (
                            <SelectItem 
                                key={child.id} 
                                value={child.id.toString()}
                                className="pl-4"
                            >
                                {child.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
        </Select>
    )
}