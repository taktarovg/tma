// src/components/bookings/BookingCard.tsx

'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { BookingWithRelations } from '@/types/booking';

interface BookingCardProps {
  booking: BookingWithRelations;
  onCancel: (id: number) => Promise<void>;
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const bookingDate = new Date(booking.bookingDateTime);
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              <h3 className="font-medium">{booking.service.name}</h3>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(bookingDate, 'dd MMMM yyyy', { locale: ru })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {format(bookingDate, 'HH:mm')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {booking.service.master.city?.name || 'Не указан город'},{' '}
                  {booking.service.master.district?.name || 'Не указан район'}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2">
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

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                >
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
                  <AlertDialogCancel>Нет</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancel(booking.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Да, отменить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}