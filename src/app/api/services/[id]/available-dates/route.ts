// src/app/api/services/[id]/available-dates/route.ts - update
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, format, addMonths, parseISO, isSameDay } from 'date-fns'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Available Dates Fetch Start ===');
    console.log('Service ID:', params.id);

    const serviceId = parseInt(params.id)
    if (isNaN(serviceId)) {
      console.log('Invalid service ID');
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      )
    }

    // Получаем информацию об услуге и расписании мастера
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        master: {
          include: {
            daySchedules: {
              where: {
                date: {
                  gte: startOfMonth(new Date()),
                  lte: endOfMonth(addMonths(new Date(), 2))
                }
              }
            },
            settings: true
          }
        }
      }
    })

    if (!service) {
      console.log('Service not found');
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    console.log('Found service:', service.id);
    console.log('Master schedules count:', service.master.daySchedules.length);

    // Получаем все существующие записи
    const bookings = await prisma.booking.findMany({
      where: {
        masterId: service.master.id,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        bookingDateTime: {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(addMonths(new Date(), 2))
        }
      }
    })

    console.log('Found bookings:', bookings.length);

    // Фильтруем дни с расписанием
    const availableDates = service.master.daySchedules
      .filter(schedule => {
        const scheduleDate = new Date(schedule.date)
        console.log('Processing date:', format(scheduleDate, 'yyyy-MM-dd'));

        // Проверяем, что день не в прошлом
        if (scheduleDate < new Date()) {
          console.log('Date is in the past');
          return false;
        }

        // Получаем все записи на этот день
        const dayBookings = bookings.filter(booking =>
          isSameDay(new Date(booking.bookingDateTime), scheduleDate)
        )
        console.log('Bookings for this day:', dayBookings.length);

        // Вычисляем количество возможных слотов
        const workHours = schedule.workHours as { start: string; end: string }
        const [startHour, startMinute] = workHours.start.split(':').map(Number)
        const [endHour, endMinute] = workHours.end.split(':').map(Number)
        const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)

        // Учитываем длительность услуги и буферное время
        const slotDuration = service.duration + (service.master.settings?.bufferTime || 15)
        const possibleSlots = Math.floor(totalMinutes / slotDuration)

        console.log('Slot calculations:', {
          totalMinutes,
          slotDuration,
          possibleSlots,
          existingBookings: dayBookings.length
        });

        // Убираем перерывы из расчета
        const breaks = schedule.breaks as Array<{ start: string; end: string }> || []
        const breakMinutes = breaks.reduce((total, breakTime) => {
          const [breakStartHour, breakStartMinute] = breakTime.start.split(':').map(Number)
          const [breakEndHour, breakEndMinute] = breakTime.end.split(':').map(Number)
          return total + ((breakEndHour * 60 + breakEndMinute) - (breakStartHour * 60 + breakStartMinute))
        }, 0)

        const availableSlots = Math.floor((totalMinutes - breakMinutes) / slotDuration)
        console.log('Available slots after breaks:', availableSlots);

        // День доступен, если есть свободные слоты
        const isAvailable = dayBookings.length < availableSlots;
        console.log('Is date available:', isAvailable);

        return isAvailable;
      })
      .map(schedule => format(new Date(schedule.date), 'yyyy-MM-dd'))

    console.log('Available dates:', availableDates);
    console.log('=== Available Dates Fetch End ===');

    return NextResponse.json({
      dates: availableDates,
      service: {
        duration: service.duration,
        bufferTime: service.master.settings?.bufferTime || 15
      }
    })
  } catch (error) {
    console.error('Available dates fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available dates' },
      { status: 500 }
    )
  }
}