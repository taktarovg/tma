// src/components/bookings/ClientBookingsList.tsx
'use client';

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import type { BookingWithRelations } from '@/types/booking';
import { BookingStatus } from '@/types/booking'; // Добавляем импорт
import { cancelBooking } from '@/actions/bookings'; // Импортируем Server Action

interface ClientBookingsListProps {
  bookings: BookingWithRelations[];
}

const STATUS_BADGES: Record<BookingStatus, { label: string; variant: 'default' | 'success' | 'destructive' | 'secondary' }> = {
  PENDING: { label: 'Ожидает', variant: 'default' },
  CONFIRMED: { label: 'Подтверждено', variant: 'success' },
  CANCELED: { label: 'Отменено', variant: 'destructive' },
  COMPLETED: { label: 'Завершено', variant: 'secondary' },
};

export function ClientBookingsList({
  bookings,
}: ClientBookingsListProps) {
  const { toast } = useToast();
  const [isCanceling, setIsCanceling] = useState<Record<number, boolean>>({});

  // Группируем записи по статусу и сортируем по дате
  const activeBookings = bookings
    .filter((booking) => ['PENDING', 'CONFIRMED'].includes(booking.status))
    .sort((a, b) => new Date(a.bookingDateTime).getTime() - new Date(b.bookingDateTime).getTime());

  const pastBookings = bookings
    .filter((booking) => ['COMPLETED', 'CANCELED'].includes(booking.status))
    .sort((a, b) => new Date(b.bookingDateTime).getTime() - new Date(a.bookingDateTime).getTime());

  const handleCancelBooking = async (bookingId: number) => {
    setIsCanceling((prev) => ({ ...prev, [bookingId]: true }));
    
    try {
      await cancelBooking(bookingId);
      toast({
        title: 'Запись отменена',
        description: 'Ваша запись была успешно отменена',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отменить запись',
        variant: 'destructive',
      });
    } finally {
      setIsCanceling((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const renderBookingCard = (booking: BookingWithRelations) => (
    <Card key={booking.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={STATUS_BADGES[booking.status].variant}>
                {STATUS_BADGES[booking.status].label}
              </Badge>
              <h3 className="font-medium">{booking.service.name}</h3>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(booking.bookingDateTime), 'dd MMMM yyyy', { locale: ru })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(booking.bookingDateTime), 'HH:mm')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {booking.service.master.city.name}, {booking.service.master.district.name}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Avatar
                src={booking.service.master.user.avatar || undefined}
                alt={booking.service.master.user.firstName}
                fallback={(booking.service.master.user.firstName[0] || '?').toUpperCase()}
              />
              <div className="text-sm">
                <div className="font-medium">
                  {booking.service.master.user.firstName} {booking.service.master.user.lastName}
                </div>
                <div className="text-muted-foreground">
                  Мастер
                </div>
              </div>
            </div>
          </div>

          {['PENDING', 'CONFIRMED'].includes(booking.status) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  disabled={isCanceling[booking.id]}
                >
                  <X className="h-4 w-4 mr-2" />
                  Отменить
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Отменить запись?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы уверены, что хотите отменить запись? Это действие нельзя будет отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleCancelBooking(booking.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Отменить запись
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {activeBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Предстоящие записи</h2>
          <div>{activeBookings.map(renderBookingCard)}</div>
        </div>
      )}

      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">История записей</h2>
          <div>{pastBookings.map(renderBookingCard)}</div>
        </div>
      )}

      {bookings.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">У вас пока нет записей</p>
            <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/'}>
              Найти мастера
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}