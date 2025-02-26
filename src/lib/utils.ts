// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
}

export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/)
    if (match) {
        return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`
    }
    return phone
}

export function getTimeSlots(
    start: number,
    end: number,
    duration: number
): string[] {
    const slots: string[] = []
    for (let hour = start; hour < end; hour++) {
        for (let minute = 0; minute < 60; minute += duration) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            slots.push(timeString)
        }
    }
    return slots
}

export function generateUsername(firstName: string, lastName: string): string {
    const normalized = `${firstName}${lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')

    return `${normalized}${Math.random().toString(36).substring(2, 5)}`
}