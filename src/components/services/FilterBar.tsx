// src/components/services/FilterBar.tsx - update
'use client'

import { FilterSelect } from "@/components/ui/FilterSelect"
import { CategorySelect } from "./CategorySelect"  // используем тот же компонент
import { useFilters } from "@/hooks/useFilters"
import { X } from "lucide-react"

interface FilterBarProps {
  cities: Array<{
    id: number
    name: string
  }>
  districts: Array<{
    id: number
    name: string
    cityId: number
  }>
  categories: Array<{
    id: string
    name: string
  }>
}

export function FilterBar({
  cities,
  districts,
  categories,
}: FilterBarProps) {
  const { filters, updateFilter, clearFilters } = useFilters()

  const selectedCityId = filters.city ? Number(filters.city) : null

  const filteredDistricts = districts.filter(
    district => selectedCityId && district.cityId === selectedCityId
  )

  const hasActiveFilters = filters.city || filters.district || filters.category

  return (
    <div className="mx-2 mt-2 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2 p-3">
        <FilterSelect
          value={filters.city}
          onChange={(e) => updateFilter('city', e.target.value)}
          options={cities.map(city => ({
            id: String(city.id),
            name: city.name
          }))}
          placeholder="Город"
          className="min-w-[120px]"
        />
        <FilterSelect
          value={filters.district}
          onChange={(e) => updateFilter('district', e.target.value)}
          options={filteredDistricts.map(district => ({
            id: String(district.id),
            name: district.name
          }))}
          placeholder="Район"
          disabled={!selectedCityId}
          className="min-w-[120px]"
        />
        <CategorySelect
          value={filters.category}
          onChange={(value) => updateFilter('category', value)}
        />
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Сбросить фильтры"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}