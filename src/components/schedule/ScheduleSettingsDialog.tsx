// src/components/schedule/ScheduleSettingsDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { DaySchedule, Break } from '@/types/schedule';

interface ScheduleSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onSave?: () => void;
}

interface MasterSettings {
  bufferTime: number;
  cancelDeadline: number;
  autoConfirm: boolean;
}

export function ScheduleSettingsDialog({ 
  open, 
  onOpenChange,
  selectedDate,
  onSave,
}: ScheduleSettingsDialogProps) {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<Partial<DaySchedule>>({
    workHours: { 
      start: '09:00', 
      end: '18:00',
    },
    breaks: [],
  });
  const [settings, setSettings] = useState<MasterSettings>({
    bufferTime: 15,
    cancelDeadline: 24,
    autoConfirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasBookings, setHasBookings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleResponse, settingsResponse] = await Promise.all([
          fetch(`/api/master/schedule/${format(selectedDate, 'yyyy-MM-dd')}`),
          fetch('/api/master/settings'),
        ]);

        if (scheduleResponse.ok) {
          const data = await scheduleResponse.json();
          if (data.schedule) {
            setSchedule(data.schedule);
          }
          setHasBookings(data.bookings?.length > 0);
        }

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSettings(settingsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить настройки",
          variant: "destructive",
        });
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, selectedDate, toast]);

  const handleSaveSchedule = async () => {
    setIsLoading(true);
    try {
      const scheduleResponse = await fetch(`/api/master/schedule/${format(selectedDate, 'yyyy-MM-dd')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedule),
      });

      if (!scheduleResponse.ok) {
        throw new Error('Failed to save schedule');
      }

      const settingsResponse = await fetch('/api/master/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!settingsResponse.ok) {
        throw new Error('Failed to save settings');
      }

      toast({
        title: 'Успешно',
        description: 'Расписание и настройки сохранены',
      });

      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addBreak = () => {
    setSchedule(prev => ({
      ...prev,
      breaks: [...(prev.breaks || []), { start: '13:00', end: '14:00' }],
    }));
  };

  const removeBreak = (index: number) => {
    setSchedule(prev => ({
      ...prev,
      breaks: prev.breaks?.filter((_, i) => i !== index),
    }));
  };

  const updateBreak = (index: number, type: 'start' | 'end', value: string) => {
    setSchedule(prev => {
      const newBreaks = [...(prev.breaks || [])];
      newBreaks[index] = { ...newBreaks[index], [type]: value };
      return { ...prev, breaks: newBreaks };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Настройка расписания на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
          </DialogTitle>
          <DialogDescription>
            Настройте рабочие часы, перерывы и общие параметры работы
          </DialogDescription>
        </DialogHeader>

        {hasBookings && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              На этот день уже есть записи. Изменение расписания может повлиять на существующие записи.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Рабочие часы */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium">Рабочие часы</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workStart">Начало работы</Label>
                <Input
                  id="workStart"
                  type="time"
                  value={schedule.workHours?.start}
                  onChange={(e) => setSchedule(prev => ({
                    ...prev,
                    workHours: { 
                      start: e.target.value,
                      end: prev.workHours?.end || '18:00', // Значение по умолчанию для end
                    },
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="workEnd">Конец работы</Label>
                <Input
                  id="workEnd"
                  type="time"
                  value={schedule.workHours?.end}
                  onChange={(e) => setSchedule(prev => ({
                    ...prev,
                    workHours: { 
                      start: prev.workHours?.start || '09:00', // Значение по умолчанию для start
                      end: e.target.value,
                    },
                  }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Перерывы */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Перерывы</h3>
            {schedule.breaks?.map((breakTime, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="flex-1">
                  <Label>Начало перерыва</Label>
                  <Input
                    type="time"
                    value={breakTime.start}
                    onChange={(e) => updateBreak(index, 'start', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label>Конец перерыва</Label>
                  <Input
                    type="time"
                    value={breakTime.end}
                    onChange={(e) => updateBreak(index, 'end', e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeBreak(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addBreak}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить перерыв
            </Button>
          </div>

          <Separator />

          {/* Настройки */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Настройки записи</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bufferTime">Интервал между записями (мин)</Label>
                <Input
                  id="bufferTime"
                  type="number"
                  min={0}
                  max={60}
                  value={settings.bufferTime}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    bufferTime: parseInt(e.target.value),
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="cancelDeadline">Срок отмены записи (часов)</Label>
                <Input
                  id="cancelDeadline"
                  type="number"
                  min={1}
                  max={72}
                  value={settings.cancelDeadline}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    cancelDeadline: parseInt(e.target.value),
                  }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoConfirm"
                checked={settings.autoConfirm}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  autoConfirm: checked,
                }))}
              />
              <Label htmlFor="autoConfirm">
                Автоматически подтверждать записи
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSaveSchedule}
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}