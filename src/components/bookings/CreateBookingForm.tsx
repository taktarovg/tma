// src/components/bookings/CreateBookingForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { TimeSlots } from './TimeSlots';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import type { Service, MasterProfile } from '@prisma/client';

interface CreateBookingFormProps {
  service: Service & {
    master: MasterProfile;
  };
}

export function CreateBookingForm({ service }: CreateBookingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        console.log('=== CreateBookingForm: Fetching Available Dates ===');
        console.log('Service ID:', service.id);
        console.log('Master ID:', service.master.id);

        const response = await fetch(`/api/services/${service.id}/available-dates`);
        console.log('Fetch response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          throw new Error('Failed to fetch available dates');
        }

        const data = await response.json();
        console.log('API Response Data:', data);
        
        const dates = data.dates.map((dateStr: string) => {
          const parsedDate = parseISO(dateStr);
          console.log('Parsing date:', dateStr, 'to:', parsedDate);
          return parsedDate;
        });

        console.log('Final available dates:', dates);
        setAvailableDates(dates);
        console.log('=== End Fetching Available Dates ===');
      } catch (error) {
        console.error('Error in fetchAvailableDates:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить доступные даты',
          variant: 'destructive',
        });
      }
    };

    fetchAvailableDates();
  }, [service.id, service.master.id, toast]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsLoading(true);
    try {
      console.log('=== CreateBookingForm: Creating Booking ===');
      const bookingData = {
        serviceId: service.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
      };
      console.log('Booking data:', bookingData);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Booking response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Booking API Error:', errorData);
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Booking success response:', result);

      toast({
        title: 'Успешно',
        description: 'Запись создана',
      });

      router.push('/bookings');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать запись',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log('=== End Creating Booking ===');
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log('=== Date Selection ===');
    console.log('Selected date:', date);
    console.log('Available dates:', availableDates);
    if (date) {
      const isAvailable = availableDates.some((availableDate) =>
        format(availableDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      console.log('Is date available:', isAvailable);
    }
    setSelectedDate(date);
    setSelectedTime(undefined); // Сбрасываем выбранное время при смене даты
    console.log('=== End Date Selection ===');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Выберите дату</CardTitle>
          <CardDescription>
            Выберите удобный день для записи
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            selected={selectedDate}
            onSelect={handleDateSelect}
            fromDate={new Date()}
            disabled={(date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isAvailable = availableDates.some((d) =>
                format(d, 'yyyy-MM-dd') === dateStr
              );
              return !isAvailable;
            }}
            modifiers={{
              available: availableDates,
            }}
            modifiersStyles={{
              available: {
                backgroundColor: '#f0fdf4',
                color: '#166534',
                fontWeight: '500',
              },
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Выберите время</CardTitle>
            <CardDescription>
              {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeSlots
              date={selectedDate}
              serviceId={service.id}
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
            />
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={!selectedDate || !selectedTime || isLoading}
      >
        {isLoading ? 'Создание записи...' : 'Записаться'}
      </Button>
    </div>
  );
}

//тестовый коммент