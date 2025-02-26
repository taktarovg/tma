// src/components/ui/CityDistrictSelect.tsx - update
'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Location {
  cities: Array<{
    id: number
    name: string
  }>
  districts: Array<{
    id: number
    name: string
    cityId: number
  }>
}

interface CityDistrictSelectProps {
  selectedCityId?: string | null
  selectedDistrictId?: string | null
  onCityChange: (cityId: string) => void
  onDistrictChange: (districtId: string) => void
}

export function CityDistrictSelect({
  selectedCityId,
  selectedDistrictId,
  onCityChange,
  onDistrictChange
}: CityDistrictSelectProps) {
  const [locations, setLocations] = useState<Location>({ cities: [], districts: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations')
        if (!response.ok) {
          throw new Error('Failed to fetch locations')
        }
        const data = await response.json()
        console.log('Fetched locations:', data)
        setLocations(data)
      } catch (error) {
        console.error('Failed to fetch locations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const currentCityId = selectedCityId ? parseInt(selectedCityId) : null
  const filteredDistricts = currentCityId 
    ? locations.districts.filter(district => district.cityId === currentCityId)
    : []

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Город
        </label>
        <Select
          value={selectedCityId || ''}
          onValueChange={onCityChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите город" />
          </SelectTrigger>
          <SelectContent>
            {locations.cities.map((city) => (
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
          value={selectedDistrictId || ''}
          onValueChange={onDistrictChange}
          disabled={!currentCityId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите район" />
          </SelectTrigger>
          <SelectContent>
            {filteredDistricts.map((district) => (
              <SelectItem key={district.id} value={district.id.toString()}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}