// src/components/bookings/MasterBookingsManager.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Avatar } from '@/components/ui/Avatar';
import { BookingStatusBadge } from './BookingStatusBadge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Check, X, CheckCircle, Clock } from 'lucide-react';
import type { BookingWithRelations } from '@/types/booking';

interface MasterBookingsManagerProps {
  initialBookings?: BookingWithRelations[];
}

export function MasterBookingsManager({ initialBookings = [] }: MasterBookingsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<BookingWithRelations[]>(initialBookings);
  const [isLoading, setIsLoading] = useState(false);
  const [workingDays, setWorkingDays] = useState<Date[]>([]);
  const [bookingDays, setBookingDays] = useState<Date[]>([]);

  // Загрузка расписания и записей
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/master/schedule/${format(selectedDate, 'yyyy-MM-dd')}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch schedule data');
        }

        const data = await response.json();
        
        setBookings(data.bookings || []);
        
        // Обновляем календарь
        if (data.schedule) {
          setWorkingDays(prev => [...prev, parseISO(data.schedule.date)]);
        }
        if (data.bookings?.length > 0) {
          setBookingDays(prev => [...prev, selectedDate]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, toast]);

  // Обновление статуса записи
  const handleStatusUpdate = async (bookingId: number, newStatus: 'CONFIRMED' | 'CANCELED' | 'COMPLETED') => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/master/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      const updatedBooking = await response.json();

      // Обновляем локальное состояние
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId ? updatedBooking : booking
        )
      );

      toast({
        title: 'Успешно',
        description: 'Статус записи обновлен',
      });
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтруем записи для выбранного дня
  const selectedDayBookings = bookings.filter(booking =>
    isSameDay(parseISO(booking.bookingDateTime.toString()), selectedDate)
  ).sort((a, b) => 
    parseISO(a.bookingDateTime.toString()).getTime() - 
    parseISO(b.bookingDateTime.toString()).getTime()
  );

  // Статистика по записям
  const bookingsStats = {
    total: selectedDayBookings.length,
    confirmed: selectedDayBookings.filter(b => b.status === 'CONFIRMED').length,
    pending: selectedDayBookings.filter(b => b.status === 'PENDING').length,
    canceled: selectedDayBookings.filter(b => b.status === 'CANCELED').length,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Календарь записей</CardTitle>
          <CardDescription>
            Управляйте записями клиентов и своим расписанием
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            fromDate={new Date()}
            modifiers={{
              working: workingDays,
              booked: bookingDays,
            }}
            modifiersStyles={{
              working: {
                backgroundColor: '#f0fdf4',
                color: '#166534',
              },
              booked: {
                fontWeight: 'bold',
                color: '#059669',
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Записи на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">
                  Всего: {bookingsStats.total}
                </Badge>
                <Badge variant="success">
                  Подтверждено: {bookingsStats.confirmed}
                </Badge>
                <Badge variant="default">
                  Ожидает: {bookingsStats.pending}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Загрузка...
              </div>
            ) : selectedDayBookings.length > 0 ? (
              selectedDayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex gap-4">
                    <Avatar
                      src={booking.user.avatar || undefined}
                      alt={`${booking.user.firstName} ${booking.user.lastName}`}
                      fallback={(booking.user.firstName?.[0] || '?').toUpperCase()}
                    />
                    <div>
                      <h4 className="font-medium">
                        {booking.user.firstName} {booking.user.lastName}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(parseISO(booking.bookingDateTime.toString()), 'HH:mm')}
                        </div>
                        <div>{booking.service.name}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <BookingStatusBadge status={booking.status} />
                    
                    {booking.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                          disabled={isLoading}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Отменить запись?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы уверены, что хотите отменить эту запись? 
                                Клиент получит уведомление об отмене.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleStatusUpdate(booking.id, 'CANCELED')}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Отменить запись
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Завершить
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Нет записей на этот день
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}