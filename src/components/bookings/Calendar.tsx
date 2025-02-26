// src/components/bookings/Calendar.tsx - update

'use client'

import { ChevronLeft, ChevronRight } from "lucide-react"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  isAfter,
  isBefore,
  isToday
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CalendarProps {
  selected?: Date
  onSelect: (date: Date) => void
  className?: string
  fromDate?: Date
  scheduledDays?: Date[]
  bookedDays?: Date[]
  fullyBookedDays?: Date[]
}

const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

export function Calendar({ 
  selected, 
  onSelect,
  className,
  fromDate = new Date(),
  scheduledDays = [],
  bookedDays = [],
  fullyBookedDays = []
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selected || new Date())
  
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  // Получаем все дни для отображения в календаре
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Разбиваем дни на недели
  const weeks = days.reduce<Date[][]>((weeks, day, i) => {
    if (i % 7 === 0) weeks.push([])
    weeks[weeks.length - 1].push(day)
    return weeks
  }, [])

  const isDateDisabled = (date: Date) => {
    // Нельзя выбрать прошедшие даты
    if (isBefore(date, fromDate)) {
      return true
    }

    // Можно выбрать только дни с расписанием
    const isScheduled = scheduledDays.some(scheduledDay => 
      isSameDay(date, new Date(scheduledDay))
    )

    return !isScheduled
  }

  const getDayState = (date: Date) => {
    const isScheduledDay = scheduledDays.some(d => isSameDay(date, new Date(d)))
    const isBookedDay = bookedDays.some(d => isSameDay(date, new Date(d)))
    const isFullyBookedDay = fullyBookedDays.some(d => isSameDay(date, new Date(d)))

    return {
      isScheduled: isScheduledDay,
      isBooked: isBookedDay,
      isFullyBooked: isFullyBookedDay
    }
  }

  return (
    <div className={cn("select-none", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isBefore(monthStart, fromDate)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Дни недели */}
        {weekDays.map((day) => (
          <div key={day} className="h-9 text-sm flex items-center justify-center text-gray-500">
            {day}
          </div>
        ))}

        {/* Дни месяца */}
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isSelected = selected && isSameDay(day, selected)
            const isDisabled = isDateDisabled(day)
            const dayState = getDayState(day)

            return (
              <button
                key={day.toString()}
                onClick={() => !isDisabled && onSelect(day)}
                disabled={isDisabled}
                className={cn(
                  "h-9 text-sm rounded-lg flex items-center justify-center transition-colors relative",
                  !isCurrentMonth && "text-gray-300",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && !isDisabled && "hover:bg-gray-100",
                  isDisabled && "text-gray-300 cursor-not-allowed bg-gray-50",
                  dayState.isScheduled && !isDisabled && !isSelected && "bg-green-50 hover:bg-green-100",
                  dayState.isBooked && !isDisabled && !isSelected && "bg-blue-50 hover:bg-blue-100",
                  dayState.isFullyBooked && !isDisabled && !isSelected && "bg-orange-50 hover:bg-orange-100",
                  isToday(day) && "font-bold"
                )}
              >
                {format(day, 'd')}
              </button>
            )
          })
        ))}
      </div>
    </div>
  )
}