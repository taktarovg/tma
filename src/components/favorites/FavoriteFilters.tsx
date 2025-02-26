// src/components/favorites/FavoriteFilters.tsx - new
'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FavoriteFiltersProps {
  activeFilter: 'newest' | 'oldest'
  onChange: (filter: 'newest' | 'oldest') => void
}

export function FavoriteFilters({ activeFilter, onChange }: FavoriteFiltersProps) {
  return (
    <div className="flex gap-2 p-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange('newest')}
        className={cn(
          "flex-1",
          activeFilter === 'newest' && "bg-primary text-primary-foreground"
        )}
      >
        Более поздние
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange('oldest')}
        className={cn(
          "flex-1",
          activeFilter === 'oldest' && "bg-primary text-primary-foreground"
        )}
      >
        Более ранние
      </Button>
    </div>
  )
}