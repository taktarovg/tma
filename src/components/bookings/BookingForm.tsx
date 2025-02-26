// src/components/bookings/BookingForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TimeSlots } from './TimeSlots';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar'; // Убедитесь, что импорт правильный
import type { Service, MasterProfile } from '@prisma/client';

interface BookingFormProps {
  service: Service & {
    master: MasterProfile & {
      workSchedule?: {
        workDays: Record<string, boolean>;
        workHours: { start: string; end: string };
        breaks: Array<{ start: string; end: string }>;
      } | null;
      settings?: {
        bufferTime: number;
      } | null;
    };
  };
}

export function BookingForm({ service }: BookingFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [existingBookings, setExistingBookings] = useState<Array<{ startTime: Date; endTime: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDate) return;

      try {
        const date = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/master/bookings?date=${date}&masterId=${service.masterId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const bookings = await response.json();
        console.log('Fetched bookings:', bookings);
        setExistingBookings(bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить существующие записи',
          variant: 'destructive',
        });
      }
    };

    fetchBookings();
  }, [selectedDate, service.masterId]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsLoading(true);
    try {
      console.log('Submitting booking:', {
        serviceId: service.id,
        date: selectedDate,
        time: selectedTime,
      });

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      toast({
        title: 'Успешно',
        description: 'Запись создана',
      });

      router.push('/bookings');
      router.refresh();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать запись',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Service master:', service.master);
    console.log('Work schedule:', service.master.workSchedule);
    console.log('Master settings:', service.master.settings);
  }, [service.master]);

  return (
    <div className="space-y-6">
      {selectedDate && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Выберите время на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
          </h3>
          
          <TimeSlots
            date={selectedDate}
            serviceId={service.id}
            workSchedule={service.master.workSchedule}
            duration={service.duration}
            bufferTime={service.master.settings?.bufferTime || 15}
            selectedTime={selectedTime}
            onSelect={setSelectedTime}
            existingBookings={existingBookings}
          />
        </div>
      )}

      <Button 
        onClick={handleSubmit}
        className="w-full"
        variant="default"
        disabled={!selectedDate || !selectedTime || isLoading}
      >
        {isLoading ? 'Создание записи...' : 'Записаться'}
      </Button>
    </div>
  );
}