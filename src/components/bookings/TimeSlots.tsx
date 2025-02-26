// src/components/bookings/TimeSlots.tsx
'use client';

import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/types/booking';

interface TimeSlotsProps {
  date: Date;
  serviceId: number;
  selectedTime?: string;
  onSelect: (time: string) => void;
  className?: string;
  workSchedule?: { // Добавляем workSchedule
    workDays: Record<string, boolean>;
    workHours: { start: string; end: string };
    breaks: Array<{ start: string; end: string }>;
  } | null;
  duration?: number; // Добавляем duration
  bufferTime?: number; // Добавляем bufferTime
  existingBookings?: Array<{ startTime: Date; endTime: Date }>; // Добавляем existingBookings
}

export function TimeSlots({
  date,
  serviceId,
  selectedTime,
  onSelect,
  className,
  workSchedule,
  duration,
  bufferTime,
  existingBookings,
}: TimeSlotsProps) {
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['timeSlots', serviceId, format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      console.log('=== TimeSlots: Fetching Time Slots ===');
      console.log('Date:', format(date, 'yyyy-MM-dd'));
      console.log('Service ID:', serviceId);

      const response = await fetch(
        `/api/services/${serviceId}/time-slots?date=${format(date, 'yyyy-MM-dd')}`
      );

      console.log('Time slots response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Time slots API error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch time slots');
      }

      const data = await response.json();
      console.log('Time slots data:', data);
      console.log('=== End Fetching Time Slots ===');
      return data;
    },
    refetchInterval: 30000, // Обновляем каждые 30 секунд
    refetchOnWindowFocus: true, // Обновляем при фокусе окна
  });

  if (error) {
    console.error('TimeSlots error:', error);
    toast({
      title: 'Ошибка',
      description: 'Не удалось загрузить доступное время',
      variant: 'destructive',
    });
  }

  if (isLoading) {
    console.log('TimeSlots: Loading state');
    return (
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i}
            className="h-9 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  const slots = data?.slots || [];
  console.log('TimeSlots: Available slots:', slots);

  if (!slots.length) {
    console.log('TimeSlots: No available slots');
    return (
      <p className="text-center text-muted-foreground py-4">
        Нет доступного времени на этот день
      </p>
    );
  }

  const handleSlotSelect = (time: string) => {
    console.log('=== TimeSlot Selection ===');
    console.log('Selected time:', time);
    onSelect(time);
    // После выбора времени обновляем данные
    refetch();
    console.log('=== End TimeSlot Selection ===');
  };

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {slots.map((slot: TimeSlot, index: number) => { // Явно указан тип index как number
        console.log('Rendering slot:', slot);
        return (
          <Button
            key={`${slot.time}-${index}`}
            variant={selectedTime === slot.time ? "default" : "outline"}
            className={cn(
              "w-full",
              slot.isPast && "opacity-50 cursor-not-allowed",
              selectedTime === slot.time && "bg-primary text-primary-foreground",
              !slot.isAvailable && "bg-gray-100 cursor-not-allowed"
            )}
            disabled={!slot.isAvailable || slot.isPast}
            onClick={() => slot.isAvailable && !slot.isPast && handleSlotSelect(slot.time)}
          >
            {slot.time}
          </Button>
        );
      })}
    </div>
  );
}