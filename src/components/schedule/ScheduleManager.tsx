// src/components/schedule/ScheduleManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { WorkSchedule, MasterSettings, DayOfWeek } from '@/types/schedule';
import { DAYS_OF_WEEK } from '@/types/schedule';

interface ScheduleManagerProps {
  initialSchedule?: WorkSchedule;
  initialSettings?: MasterSettings;
  onSave: (data: { schedule: WorkSchedule; settings: MasterSettings }) => Promise<void>;
}

export function ScheduleManager({ 
  initialSchedule,
  initialSettings,
  onSave 
}: ScheduleManagerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [schedule, setSchedule] = useState<WorkSchedule>(initialSchedule || {
    workDays: { '1': true, '2': true, '3': true, '4': true, '5': true, '6': false, '7': false },
    workHours: { start: '09:00', end: '18:00' },
    breaks: [],
  });

  const [settings, setSettings] = useState<MasterSettings>(
    initialSettings || {
      id: 0, // Временное значение, будет заменено реальным из initialSettings
      masterId: 0, // Временное значение, будет заменено реальным из initialSettings
      bufferTime: 15,
      cancelDeadline: 24,
      autoConfirm: false,
      createdAt: new Date(), // Временное значение
      updatedAt: new Date(), // Временное значение
    }
  );

  const handleDayToggle = (day: DayOfWeek) => {
    setSchedule(prev => ({
      ...prev,
      workDays: {
        ...prev.workDays,
        [day]: !prev.workDays[day],
      },
    }));
  };

  const handleWorkHoursChange = (
    type: 'start' | 'end',
    value: string
  ) => {
    setSchedule(prev => ({
      ...prev,
      workHours: {
        ...prev.workHours,
        [type]: value,
      },
    }));
  };

  const addBreak = () => {
    setSchedule(prev => ({
      ...prev,
      breaks: [
        ...(prev.breaks || []),
        { start: '13:00', end: '14:00' },
      ],
    }));
  };

  const updateBreak = (index: number, type: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      breaks: prev.breaks?.map((brk, i) => 
        i === index ? { ...brk, [type]: value } : brk
      ) || [],
    }));
  };

  const removeBreak = (index: number) => {
    setSchedule(prev => ({
      ...prev,
      breaks: prev.breaks?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave({ schedule, settings });
      toast({
        title: 'Успешно',
        description: 'Расписание и настройки сохранены',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить расписание',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Рабочие дни */}
      <Card>
        <CardHeader>
          <CardTitle>Рабочие дни</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {(Object.entries(DAYS_OF_WEEK) as [DayOfWeek, string][]).map(([day, label]) => (
              <div key={day} className="flex items-center space-x-2">
                <Switch
                  id={`day-${day}`}
                  checked={schedule.workDays[day]}
                  onCheckedChange={() => handleDayToggle(day)}
                />
                <Label htmlFor={`day-${day}`}>{label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Рабочие часы */}
      <Card>
        <CardHeader>
          <CardTitle>Рабочие часы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workStart">Начало работы</Label>
              <Input
                id="workStart"
                type="time"
                value={schedule.workHours.start}
                onChange={e => handleWorkHoursChange('start', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEnd">Конец работы</Label>
              <Input
                id="workEnd"
                type="time"
                value={schedule.workHours.end}
                onChange={e => handleWorkHoursChange('end', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Перерывы */}
      <Card>
        <CardHeader>
          <CardTitle>Перерывы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedule.breaks && schedule.breaks.map((breakTime, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Начало перерыва</Label>
                  <Input
                    type="time"
                    value={breakTime.start}
                    onChange={e => updateBreak(index, 'start', e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Конец перерыва</Label>
                  <Input
                    type="time"
                    value={breakTime.end}
                    onChange={e => updateBreak(index, 'end', e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeBreak(index)}
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addBreak}
              className="w-full"
            >
              Добавить перерыв
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Дополнительные настройки */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки записи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bufferTime">Интервал между записями (мин)</Label>
                <Input
                  id="bufferTime"
                  type="number"
                  min={0}
                  max={60}
                  value={settings.bufferTime}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    bufferTime: parseInt(e.target.value),
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancelDeadline">Срок отмены записи (часов)</Label>
                <Input
                  id="cancelDeadline"
                  type="number"
                  min={1}
                  max={72}
                  value={settings.cancelDeadline}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    cancelDeadline: parseInt(e.target.value),
                  }))}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-2">
              <Switch
                id="autoConfirm"
                checked={settings.autoConfirm}
                onCheckedChange={checked => setSettings(prev => ({
                  ...prev,
                  autoConfirm: checked,
                }))}
              />
              <Label htmlFor="autoConfirm">
                Автоматически подтверждать записи
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : 'Сохранить расписание'}
        </Button>
      </div>
    </form>
  );
}