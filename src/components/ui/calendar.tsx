// src/components/ui/calendar.tsx
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, SelectSingleEventHandler } from "react-day-picker";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { isSameDay } from "date-fns";

export type CalendarProps = React.ComponentPropsWithoutRef<typeof DayPicker> & {
  availableDates?: Date[];
  scheduledDays?: Date[];
  bookedDays?: Date[];
  fullyBookedDays?: Date[];
  selected?: Date | undefined;
  onSelect?: SelectSingleEventHandler;
  fromDate?: Date;
  disabled?: ((date: Date) => boolean) | Date[] | undefined;
  modifiers?: { [key: string]: Date[] };
  modifiersStyles?: { [key: string]: React.CSSProperties };
  className?: string;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  availableDates = [],
  scheduledDays = [],
  bookedDays = [],
  fullyBookedDays = [],
  disabled,
  selected,
  onSelect,
  fromDate,
  modifiers = {},
  modifiersStyles = {},
  ...props
}: CalendarProps) {
  // Создаем модификаторы для разных состояний дней
  const defaultModifiers = {
    available: availableDates,
    scheduled: scheduledDays,
    booked: bookedDays,
    fullyBooked: fullyBookedDays,
    past: (date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0)),
    unavailable: (date: Date) =>
      availableDates.length > 0 && !availableDates.some(d => isSameDay(d, date)),
  };

  // Объединяем дефолтные модификаторы с переданными через пропс
  const combinedModifiers = { ...defaultModifiers, ...modifiers };

  // Стили для модификаторов
  const defaultModifiersStyles = {
    available: {
      backgroundColor: "#f0fdf4",
      color: "#166534",
      fontWeight: "500",
    },
    scheduled: {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    booked: {
      backgroundColor: "#22c55e",
      color: "white",
    },
    fullyBooked: {
      backgroundColor: "#fb923c",
      color: "white",
    },
    past: {
      opacity: 0.5,
    },
    unavailable: {
      opacity: 0.5,
    },
    today: {
      fontWeight: "600",
    },
    selected: {
      backgroundColor: "#3b82f6 !important",
      color: "white !important",
      fontWeight: "600",
    },
  };

  // Объединяем дефолтные стили с переданными через пропс
  const combinedModifiersStyles = { ...defaultModifiersStyles, ...modifiersStyles };

  // Адаптер для onSelect
  const handleSelect: SelectSingleEventHandler = (date, selectedDay, activeModifiers, e) => {
    if (onSelect) {
      onSelect(date, selectedDay, activeModifiers, e);
    }
  };

  // Определяем disabled для DayPicker
  const disabledMatcher = typeof disabled === 'function' ? disabled : [
    ...(Array.isArray(disabled) ? disabled : []),
    ...(fullyBookedDays || []),
    { before: fromDate || new Date() },
  ];

  return (
    <DayPicker
      mode="single" // Режим одиночного выбора
      showOutsideDays={showOutsideDays}
      locale={ru}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex relative items-center justify-center pt-1 pb-4",
        caption_label: "text-sm font-medium",
        nav: "flex absolute inset-0 justify-between items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 hover:bg-accent rounded-lg transition-colors",
          "opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] h-9 text-center",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal rounded-lg transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed bg-muted/50",
        day_range_middle: "day-range-middle",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      modifiers={combinedModifiers}
      modifiersStyles={combinedModifiersStyles}
      selected={selected}
      // @ts-ignore: Suppress TypeScript error due to react-day-picker type mismatch
      onSelect={handleSelect}
      fromDate={fromDate}
      disabled={disabledMatcher} // Передаём обработанный disabled
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };