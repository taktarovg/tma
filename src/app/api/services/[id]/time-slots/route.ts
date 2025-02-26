// src/app/api/services/[id]/time-slots/route.ts - update
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
    format,
    parse,
    addMinutes,
    isBefore,
    parseISO,
    isAfter,
    startOfDay,
    endOfDay
} from 'date-fns'
import { z } from 'zod'

const querySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
})

const parseTime = (timeStr: string, dateStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = parse(dateStr, 'yyyy-MM-dd', new Date())
    return new Date(date.setHours(hours, minutes, 0, 0))
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        console.log('=== Time Slots API: Start ===');
        const { searchParams } = new URL(request.url)
        console.log('Search params:', Object.fromEntries(searchParams.entries()));

        const { date } = querySchema.parse({
            date: searchParams.get('date')
        })
        console.log('Requested date:', date);

        const serviceId = parseInt(params.id)
        console.log('Service ID:', serviceId);

        if (isNaN(serviceId)) {
            console.log('Invalid service ID');
            return NextResponse.json(
                { error: 'Invalid service ID' },
                { status: 400 }
            )
        }

        // Получаем информацию об услуге и мастере
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                master: {
                    include: {
                        daySchedules: {
                            where: {
                                date: parse(date, 'yyyy-MM-dd', new Date())
                            }
                        },
                        settings: true,
                        bookings: {
                            where: {
                                bookingDateTime: {
                                    gte: startOfDay(parse(date, 'yyyy-MM-dd', new Date())),
                                    lte: endOfDay(parse(date, 'yyyy-MM-dd', new Date()))
                                },
                                status: {
                                    in: ['PENDING', 'CONFIRMED']
                                }
                            },
                            include: {
                                service: true
                            }
                        }
                    }
                }
            }
        })

        console.log('Found service:', service ? 'yes' : 'no');
        console.log('Master schedules count:', service?.master.daySchedules.length);
        console.log('Existing bookings:', service?.master.bookings.length);

        if (!service) {
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            )
        }

        const schedule = service.master.daySchedules[0]
        console.log('Schedule for requested date:', schedule);

        if (!schedule) {
            console.log('No schedule found for this date');
            return NextResponse.json({
                slots: [],
                message: 'No schedule available for this date'
            })
        }

        // Генерируем временные слоты
        const slots: { time: string; isAvailable: boolean; isPast: boolean }[] = []
        const now = new Date()

        const workHours = schedule.workHours as { start: string; end: string }
        const breaks = (schedule.breaks || []) as Array<{ start: string; end: string }>
        const bufferTime = service.master.settings?.bufferTime || 15

        console.log('Schedule details:', {
            workHours,
            breaks,
            bufferTime,
            serviceDuration: service.duration
        });

        let currentTime = parseTime(workHours.start, date)
        const endTime = parseTime(workHours.end, date)

        console.log('Generating slots between:', format(currentTime, 'HH:mm'), 'and', format(endTime, 'HH:mm'));

        while (isBefore(currentTime, endTime)) {
            const timeString = format(currentTime, 'HH:mm')
            const slotEnd = addMinutes(currentTime, service.duration)
            const slotWithBuffer = addMinutes(currentTime, service.duration + bufferTime)

            // Проверяем, не попадает ли слот на перерыв
            const isInBreak = breaks.some(breakTime => {
                const breakStart = parseTime(breakTime.start, date)
                const breakEnd = parseTime(breakTime.end, date)
                const slotOverlapsBreak = (
                    (isAfter(slotEnd, breakStart) || slotEnd.getTime() === breakStart.getTime()) &&
                    (isBefore(currentTime, breakEnd) || currentTime.getTime() === breakEnd.getTime())
                )
                console.log(`Checking break ${breakTime.start}-${breakTime.end} for slot ${timeString}:`, slotOverlapsBreak);
                return slotOverlapsBreak;
            })

            // Проверяем пересечение с существующими записями
            const isBooked = service.master.bookings.some(booking => {
                const bookingStart = new Date(booking.bookingDateTime)
                const bookingEnd = addMinutes(
                    bookingStart,
                    booking.service.duration + bufferTime
                )
                const slotOverlapsBooking = (
                    (isAfter(slotWithBuffer, bookingStart) || slotWithBuffer.getTime() === bookingStart.getTime()) &&
                    (isBefore(currentTime, bookingEnd) || currentTime.getTime() === bookingEnd.getTime())
                )
                console.log(`Checking booking at ${format(bookingStart, 'HH:mm')} for slot ${timeString}:`, slotOverlapsBooking);
                return slotOverlapsBooking;
            })

            const isPast = isAfter(now, currentTime)

            const slotInfo = {
                time: timeString,
                isAvailable: !isInBreak && !isBooked && !isPast,
                isPast,
                debug: {
                    isInBreak,
                    isBooked,
                    isPast
                }
            };
            console.log('Generated slot:', slotInfo);

            slots.push({
                time: timeString,
                isAvailable: !isInBreak && !isBooked && !isPast,
                isPast
            })

            currentTime = addMinutes(currentTime, service.duration + bufferTime)
        }

        // Добавляем информацию о доступности для отладки
        const availability = {
            totalSlots: slots.length,
            availableSlots: slots.filter(slot => slot.isAvailable).length,
            isFullyBooked: slots.every(slot => !slot.isAvailable || slot.isPast),
            nextAvailableSlot: slots.find(slot => slot.isAvailable)?.time
        }
        console.log('Availability summary:', availability);

        console.log('=== Time Slots API: End ===');

        return NextResponse.json({
            slots,
            availability,
            schedule: {
                workHours,
                breaks,
                bufferTime
            }
        })
    } catch (error) {
        console.error('Time slots error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.errors },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to fetch time slots' },
            { status: 500 }
        )
    }
}