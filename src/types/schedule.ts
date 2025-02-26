// src/types/schedule.ts - update

export interface WorkHours {
  start: string
  end: string
}

export interface Break {
  start: string
  end: string
}

export interface DaySchedule {
  id: number
  masterId: number
  date: Date
  workHours: WorkHours
  breaks: Break[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkSchedule {
  workHours: WorkHours
  breaks: Break[]
  workDays: {
    [key: string]: boolean
  }
}

export interface MasterSettings {
  id: number
  masterId: number
  bufferTime: number
  cancelDeadline: number
  autoConfirm: boolean
  createdAt: Date
  updatedAt: Date
}

export type { DaySchedule as Schedule }

export const DAYS_OF_WEEK = {
  '1': 'Понедельник',
  '2': 'Вторник',
  '3': 'Среда',
  '4': 'Четверг',
  '5': 'Пятница',
  '6': 'Суббота',
  '7': 'Воскресенье'
} as const

export type DayOfWeek = keyof typeof DAYS_OF_WEEK

export interface DayAvailability {
  date: Date
  isWorkingDay: boolean
  hasBookings: boolean
  isFullyBooked: boolean
  availableSlots: number
  totalSlots: number
}

export interface MonthSchedule {
  workingDays: DayAvailability[]
  stats: {
    totalWorkingDays: number
    totalBookings: number
    averageBookingsPerDay: number
  }
}