// src/types/booking.ts
import type { Booking, Service, MasterProfile, User, City, District } from '@prisma/client';
import { z } from 'zod';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
}

export type BookingWithRelations = Booking & {
  user: Pick<User, 'telegramId' | 'firstName' | 'lastName' | 'avatar'>;
  service: Service & {
    master: MasterProfile & {
      user: Pick<User, 'telegramId' | 'firstName' | 'lastName' | 'avatar'>;
      city: Pick<City, 'id' | 'name'>;
      district: Pick<District, 'id' | 'name'>;
    };
  };
  master: MasterProfile & {
    city: Pick<City, 'id' | 'name'>;
    district: Pick<District, 'id' | 'name'>;
    user: Pick<User, 'telegramId' | 'firstName' | 'lastName' | 'avatar'>;
  };
};

export type TimeSlot = {
  time: string;
  isAvailable: boolean;
  isPast: boolean;
};

// Схема валидации для создания бронирования
export const bookingSchema = z.object({
  serviceId: z.number().positive('Service ID must be a positive number'),
  userId: z.number().positive('User ID must be a positive number'),
  masterId: z.number().positive('Master ID must be a positive number'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  cancelDeadline: z.string().datetime({ message: 'Cancel deadline must be a valid ISO datetime' }), // Добавлено
  status: z.enum([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELED, BookingStatus.COMPLETED]).default(BookingStatus.PENDING).optional(),
  notes: z.string().optional(),
});