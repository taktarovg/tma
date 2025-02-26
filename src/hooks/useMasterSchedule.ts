// src/hooks/useMasterSchedule.ts

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import type { Schedule, WorkSchedule, MasterSettings } from '@/types/schedule';
import type { BookingWithRelations } from '@/types/booking';

interface UseScheduleOptions {
    onSuccessUpdate?: () => void;
}

interface DayData {
    schedule: Schedule | null;
    bookings: BookingWithRelations[];
    dayStats: {
        totalBookings: number;
        confirmedBookings: number;
        pendingBookings: number;
    };
}

export function useMasterSchedule(date: Date, options?: UseScheduleOptions) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Получение данных на конкретный день
    const {
        data: dayData,
        isLoading: isLoadingDay,
        error: dayError,
        refetch: refetchDay,
    } = useQuery<DayData>({
        queryKey: ['schedule', format(date, 'yyyy-MM-dd')],
        queryFn: async () => {
            const response = await fetch(`/api/master/schedule/${format(date, 'yyyy-MM-dd')}`);
            if (!response.ok) {
                throw new Error('Failed to fetch schedule');
            }
            return response.json();
        },
    });

    // Получение всех дней с расписанием для текущего месяца
    const {
        data: monthSchedules,
        isLoading: isLoadingMonth,
        refetch: refetchMonth,
    } = useQuery<Schedule[]>({
        queryKey: ['schedules', format(date, 'yyyy-MM')],
        queryFn: async () => {
            const startDate = startOfMonth(date);
            const endDate = endOfMonth(date);
            const response = await fetch(
                `/api/master/schedule?start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch month schedules');
            }
            const data = await response.json();
            return data.schedules;
        },
    });

    // Получение общих настроек мастера
    const {
        data: settings,
        isLoading: isLoadingSettings,
    } = useQuery<MasterSettings>({
        queryKey: ['masterSettings'],
        queryFn: async () => {
            const response = await fetch('/api/master/settings');
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }
            return response.json();
        },
    });

    // Мутация для обновления расписания
    const updateSchedule = useMutation({
        mutationFn: async (newSchedule: WorkSchedule) => {
            const response = await fetch(`/api/master/schedule/${format(date, 'yyyy-MM-dd')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSchedule),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update schedule');
            }
            return response.json();
        },
        onSuccess: () => {
            // Инвалидируем кэш для обновления данных
            queryClient.invalidateQueries({
                queryKey: ['schedule', format(date, 'yyyy-MM-dd')],
            });
            queryClient.invalidateQueries({
                queryKey: ['schedules', format(date, 'yyyy-MM')],
            });

            toast({
                title: 'Успешно',
                description: 'Расписание обновлено',
            });

            options?.onSuccessUpdate?.();
        },
        onError: (error) => {
            console.error('Schedule update error:', error);
            toast({
                title: 'Ошибка',
                description: error instanceof Error ? error.message : 'Не удалось обновить расписание',
                variant: 'destructive',
            });
        },
    });

    // Мутация для обновления настроек
    const updateSettings = useMutation({
        mutationFn: async (newSettings: Partial<MasterSettings>) => {
            const response = await fetch('/api/master/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSettings),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update settings');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['masterSettings'] });
            toast({
                title: 'Успешно',
                description: 'Настройки обновлены',
            });
        },
        onError: (error) => {
            console.error('Settings update error:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось обновить настройки',
                variant: 'destructive',
            });
        },
    });

    const refreshData = async () => {
        await Promise.all([refetchDay(), refetchMonth()]);
    };

    return {
        schedule: dayData?.schedule || null,
        bookings: dayData?.bookings || [],
        dayStats: dayData?.dayStats || {
            totalBookings: 0,
            confirmedBookings: 0,
            pendingBookings: 0,
        },
        monthSchedules: monthSchedules || [],
        settings,
        isLoading: isLoadingDay || isLoadingMonth || isLoadingSettings,
        error: dayError,
        updateSchedule,
        updateSettings,
        refreshData,
        isUpdating: updateSchedule.isPending || updateSettings.isPending, // Замена isLoading на isPending
    };
}