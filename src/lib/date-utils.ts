// src/lib/date-utils.ts - update
import { addMinutes, format, parse, isAfter, isBefore, isEqual } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Break, WorkSchedule } from '@/types/schedule'
import type { TimeSlot } from '@/types/booking'

export function generateTimeSlots(
    date: Date,
    workSchedule: WorkSchedule | null,
    serviceDuration: number,
    bufferTime: number,
    existingBookings: { startTime: Date; endTime: Date }[]
): TimeSlot[] {
    const slots: TimeSlot[] = []
    const now = new Date()

    // Если нет расписания, возвращаем пустой массив
    if (!workSchedule || !workSchedule.workHours) {
        return []
    }

    // Проверяем, является ли день рабочим
    const dayOfWeek = format(date, 'i')
    if (!workSchedule.workDays[dayOfWeek]) {
        return []
    }

    // Парсим время начала и конца рабочего дня
    const dayStart = parse(workSchedule.workHours.start, 'HH:mm', date)
    const dayEnd = parse(workSchedule.workHours.end, 'HH:mm', date)

    let currentTime = dayStart
    const totalDuration = serviceDuration + bufferTime

    while (isBefore(currentTime, dayEnd)) {
        const slotEnd = addMinutes(currentTime, serviceDuration)
        const slotWithBuffer = addMinutes(currentTime, totalDuration)

        // Проверяем, не попадает ли слот на перерыв
        const isInBreak = workSchedule.breaks?.some(breakTime =>
            isSlotInBreak(currentTime, slotEnd, breakTime)
        ) || false

        // Проверяем, не пересекается ли слот с существующими записями
        const isBooked = existingBookings.some(booking =>
            isSlotOverlapping(currentTime, slotWithBuffer, booking.startTime, booking.endTime)
        )

        const isPast = isAfter(now, currentTime)

        slots.push({
            time: format(currentTime, 'HH:mm'),
            isAvailable: !isInBreak && !isBooked && !isPast,
            isPast
        })

        currentTime = addMinutes(currentTime, totalDuration)
    }

    return slots
}

function isSlotInBreak(
    slotStart: Date,
    slotEnd: Date,
    breakTime: Break
): boolean {
    const breakStart = parse(breakTime.start, 'HH:mm', slotStart)
    const breakEnd = parse(breakTime.end, 'HH:mm', slotStart)

    return (
        (isEqual(slotStart, breakStart) || isAfter(slotStart, breakStart)) &&
        (isEqual(slotEnd, breakEnd) || isBefore(slotEnd, breakEnd))
    )
}

function isSlotOverlapping(
    slotStart: Date,
    slotEnd: Date,
    bookingStart: Date,
    bookingEnd: Date
): boolean {
    return (
        (isEqual(slotStart, bookingStart) || isAfter(slotStart, bookingStart)) &&
        (isEqual(slotEnd, bookingEnd) || isBefore(slotEnd, bookingEnd))
    )
}

export function formatBookingDate(date: Date): string {
    return format(date, 'dd MMMM yyyy', { locale: ru })
}

export function formatBookingTime(time: string): string {
    return format(parse(time, 'HH:mm', new Date()), 'HH:mm')
}

export function combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number)
    const result = new Date(date)
    result.setHours(hours, minutes, 0, 0)
    return result
}