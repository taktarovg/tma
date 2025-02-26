// src/components/ui/FilterSelect.tsx - update
'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface FilterSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: {
    id: string
    name: string
  }[]
  placeholder?: string
}

const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ className, options, placeholder, disabled, value, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex-1 px-4 py-2 rounded-full text-sm border border-gray-200",  // обновили стили
          disabled 
            ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100" 
            : "bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          className
        )}
        ref={ref}
        disabled={disabled}
        value={value}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    )
  }
)
FilterSelect.displayName = "FilterSelect"

export { FilterSelect }