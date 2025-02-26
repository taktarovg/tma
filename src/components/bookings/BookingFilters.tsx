// src/components/bookings/BookingFilters.tsx - new

'use client';

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FilterType = 'upcoming' | 'past' | 'all'

interface BookingFiltersProps {
  activeFilter: FilterType
  onChange: (filter: FilterType) => void
}

export function BookingFilters({ activeFilter, onChange }: BookingFiltersProps) {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange('upcoming')}
        className={cn(
          activeFilter === 'upcoming' && "bg-primary text-primary-foreground"
        )}
      >
        Предстоящие
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange('past')}
        className={cn(
          activeFilter === 'past' && "bg-primary text-primary-foreground"
        )}
      >
        Прошедшие
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange('all')}
        className={cn(
          activeFilter === 'all' && "bg-primary text-primary-foreground"
        )}
      >
        Все записи
      </Button>
    </div>
  )
}