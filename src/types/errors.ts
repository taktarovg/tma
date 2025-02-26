// src/types/errors.ts - update

export class AppError extends Error {
    constructor(
        message: string,
        public status: number = 500,
        public code?: string
    ) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_REQUIRED')
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Permission denied') {
        super(message, 403, 'PERMISSION_DENIED')
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR')
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND')
    }
}

export class BookingError extends AppError {
    constructor(message: string) {
        super(message, 400, 'BOOKING_ERROR')
    }
}

export class TelegramBotError extends AppError {
    constructor(message: string, status: number = 500) {
        super(message, status, 'TELEGRAM_BOT_ERROR')
    }
}

export class ScheduleError extends AppError {
    constructor(message: string) {
        super(message, 400, 'SCHEDULE_ERROR')
    }
}

// Добавляем предопределенные сообщения об ошибках
export const BookingErrorMessages = {
    PAST_TIME: 'Cannot book for past time',
    NO_SCHEDULE: 'No schedule available for this date',
    SLOT_BOOKED: 'Time slot is already booked',
    SERVICE_NOT_FOUND: 'Service not found',
    INVALID_TIME: 'Invalid booking time',
    OUTSIDE_WORKING_HOURS: 'Time is outside working hours',
    DURING_BREAK: 'Time is during break hours'
} as const