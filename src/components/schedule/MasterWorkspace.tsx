// src/components/schedule/MasterWorkspace.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, addDays, subDays, parseISO, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleSettingsDialog } from './ScheduleSettingsDialog';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge';
import { useQueryClient } from '@tanstack/react-query';
import type { BookingWithRelations } from '@/types/booking';

// Тип для объекта расписания
type Schedule = {
  date: string;
  workHours: { start: string; end: string };
};

export function MasterWorkspace() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledDays, setScheduledDays] = useState<Date[]>([]);
  const [bookedDays, setBookedDays] = useState<Date[]>([]);
  const [fullyBookedDays, setFullyBookedDays] = useState<Date[]>([]);
  const queryClient = useQueryClient();

  const fetchMonthData = async () => {
    try {
      setIsLoading(true);
      console.log('=== Fetching Month Data ===');
      const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      // Получаем все записи за месяц
      const response = await fetch(`/api/master/bookings?start=${format(monthStart, 'yyyy-MM-dd')}&end=${format(monthEnd, 'yyyy-MM-dd')}`);
      if (!response.ok) throw new Error('Failed to fetch month data');
      
      const data = await response.json();
      const monthBookings = data.bookings || [];

      // Получаем расписание на месяц
      const scheduleResponse = await fetch(`/api/master/schedule?month=${format(selectedDate, 'yyyy-MM')}`);
      if (!scheduleResponse.ok) throw new Error('Failed to fetch schedule data');
      
      const scheduleData = await scheduleResponse.json();
      const schedules: Schedule[] = scheduleData.schedules || [];

      console.log('Fetched data:', {
        bookings: monthBookings.length,
        schedules: schedules.length,
      });

      // Обновляем состояние записей
      setBookings(monthBookings);

      // Группируем записи по дням
      const bookingsByDay = monthBookings.reduce(
        (acc: Record<string, BookingWithRelations[]>, booking: BookingWithRelations) => {
          const date = format(booking.bookingDateTime, 'yyyy-MM-dd');
          if (!acc[date]) acc[date] = [];
          acc[date].push(booking);
          return acc;
        },
        {} as Record<string, BookingWithRelations[]>
      );

      // Определяем статусы дней
      const scheduled: Date[] = [];
      const booked: Date[] = [];
      const fullyBooked: Date[] = [];

      schedules.forEach((schedule: Schedule) => {
        const date = parseISO(schedule.date);
        scheduled.push(date);

        const dayBookings = bookingsByDay[format(date, 'yyyy-MM-dd')] || [];
        if (dayBookings.length > 0) {
          // Вычисляем возможные слоты
          const workHours = schedule.workHours as { start: string; end: string };
          const [startHour, startMinute] = workHours.start.split(':').map(Number);
          const [endHour, endMinute] = workHours.end.split(':').map(Number);
          const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
          const possibleSlots = Math.floor(totalMinutes / 60); // Предполагаем средний слот 1 час

          if (dayBookings.length >= possibleSlots) {
            fullyBooked.push(date);
          } else {
            booked.push(date);
          }
        }
      });

      setScheduledDays(scheduled);
      setBookedDays(booked);
      setFullyBookedDays(fullyBooked);

      console.log('Updated calendar states:', {
        scheduled: scheduled.length,
        booked: booked.length,
        fullyBooked: fullyBooked.length,
      });
      console.log('=== Month Data Fetch Complete ===');
    } catch (error) {
      console.error('Month data fetch error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные за месяц',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('=== Refreshing Data ===');
      
      // Инвалидируем все связанные запросы
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['schedule'] }),
        queryClient.invalidateQueries({ queryKey: ['available-dates'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
      ]);

      // Перезагружаем данные
      await fetchMonthData();
      
      console.log('=== Data Refresh Complete ===');
    } catch (error) {
      console.error('Data refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  // Загружаем данные при монтировании и смене месяца
  useEffect(() => {
    fetchMonthData();
  }, [selectedDate]);

  // Обновляем данные каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const selectedDayBookings = bookings
    .filter(booking => isSameDay(parseISO(booking.bookingDateTime.toString()), selectedDate))
    .sort((a, b) => 
      parseISO(a.bookingDateTime.toString()).getTime() - 
      parseISO(b.bookingDateTime.toString()).getTime()
    );

  return (
    <div className="max-w-lg mx-auto space-y-4 p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">Рабочий календарь</h1>
        <p className="text-muted-foreground">
          Управляйте записями клиентов и рабочим расписанием
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <Calendar
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="w-full"
            fromDate={new Date()}
            modifiers={{
              booked: bookedDays,
              scheduled: scheduledDays,
              fullyBooked: fullyBookedDays,
            }}
            modifiersStyles={{
              scheduled: {
                backgroundColor: '#dcfce7',
                color: '#166534',
              },
              booked: {
                backgroundColor: '#059669',
                color: 'white',
                fontWeight: '600',
              },
              fullyBooked: {
                backgroundColor: '#dc2626',
                color: 'white',
                fontWeight: '600',
              },
            }}
          />
        </CardContent>
      </Card>

      <Button 
        className="w-full"
        onClick={() => setIsSettingsOpen(true)}
      >
        Настроить расписание на {format(selectedDate, 'd MMMM', { locale: ru })}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(prev => subDays(prev, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                Записи на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(prev => addDays(prev, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                Загрузка...
              </div>
            ) : selectedDayBookings.length > 0 ? (
              selectedDayBookings.map((booking) => (
                <div key={booking.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookingStatusBadge status={booking.status} />
                      <h3 className="font-medium">{booking.service.name}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(booking.bookingDateTime.toString()), 'HH:mm')}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        {booking.user.avatar && (
                          <img 
                            src={booking.user.avatar} 
                            alt={`${booking.user.firstName} ${booking.user.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {booking.user.firstName} {booking.user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Клиент
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Нет записей на этот день
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ScheduleSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        selectedDate={selectedDate}
        onSave={async () => {
          setIsSettingsOpen(false);
          await refreshData();
        }}
      />
    </div>
  );
}