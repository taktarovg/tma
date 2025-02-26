// src/components/bookings/BookingStatusBadge.tsx - update

'use client';

import { Badge } from "@/components/ui/badge"
import { BookingStatus } from "@prisma/client"
import { Clock, CheckCircle, XCircle, CheckCircle2 } from "lucide-react"

interface BookingStatusBadgeProps {
  status: BookingStatus
  className?: string
}

const STATUS_CONFIG = {
  PENDING: {
    variant: "default" as const,
    label: "Ожидает подтверждения",
    icon: Clock
  },
  CONFIRMED: {
    variant: "success" as const,
    label: "Подтверждена",
    icon: CheckCircle
  },
  CANCELED: {
    variant: "destructive" as const,
    label: "Отменена",
    icon: XCircle
  },
  COMPLETED: {
    variant: "secondary" as const,
    label: "Завершена",
    icon: CheckCircle2
  }
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="h-3.5 w-3.5 mr-1" />
      {config.label}
    </Badge>
  )
}

export function getStatusText(status: BookingStatus): string {
  return STATUS_CONFIG[status].label
}

export function getStatusVariant(status: BookingStatus): string {
  return STATUS_CONFIG[status].variant
}