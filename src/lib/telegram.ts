// src/lib/telegram.ts

'use client'; // Добавляем директиву для изоляции клиентского кода

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TelegramBotError } from '@/types/errors';
import type { BookingWithRelations } from '@/types/booking';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined');
}

export async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) return;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new TelegramBotError(`Failed to send message: ${error.description}`, response.status);
    }

    return await response.json();
  } catch (error) {
    console.error('Telegram bot error:', error);
  }
}

export async function sendBookingNotification(booking: BookingWithRelations, masterChatId: string, clientChatId: string) {
  if (!masterChatId || !clientChatId) {
    console.log('Missing telegram IDs for notification');
    return;
  }

  const bookingDate = format(new Date(booking.bookingDateTime), 'dd MMMM yyyy в HH:mm', { locale: ru });

  const masterMessage = `
🆕 Новая запись!

Клиент: ${booking.user.firstName} ${booking.user.lastName || ''}
Услуга: ${booking.service.name}
Дата: ${bookingDate}
Статус: ${getBookingStatusText(booking.status)}

${booking.notes ? `\nКомментарий: ${booking.notes}` : ''}
`;

  const clientMessage = `
✅ Запись создана!

Мастер: ${booking.service.master.user.firstName} ${booking.service.master.user.lastName}
Услуга: ${booking.service.name}
Дата: ${bookingDate}
Статус: ${getBookingStatusText(booking.status)}

${booking.status === 'PENDING' ? '\nОжидайте подтверждения от мастера.' : ''}
`;

  try {
    await Promise.allSettled([
      sendTelegramMessage(masterChatId, masterMessage),
      sendTelegramMessage(clientChatId, clientMessage),
    ]);
  } catch (error) {
    console.error('Failed to send booking notifications:', error);
  }
}

export async function sendBookingStatusNotification(booking: BookingWithRelations) {
  if (!booking.user.telegramId) {
    console.log('Missing client telegram ID for status notification');
    return;
  }

  const bookingDate = format(new Date(booking.bookingDateTime), 'dd MMMM yyyy в HH:mm', { locale: ru });

  const clientMessage = `
📝 Статус записи изменен!

Мастер: ${booking.service.master.user.firstName} ${booking.service.master.user.lastName}
Услуга: ${booking.service.name}
Дата: ${bookingDate}
Новый статус: ${getBookingStatusText(booking.status)}
`;

  try {
    await sendTelegramMessage(booking.user.telegramId, clientMessage);
  } catch (error) {
    console.error('Failed to send status notification:', error);
  }
}

export async function sendBookingReminder(booking: BookingWithRelations) {
  try {
    const bookingDate = format(new Date(booking.bookingDateTime), 'dd MMMM yyyy в HH:mm', { locale: ru });

    if (booking.user.telegramId) {
      const clientMessage = `
⏰ Напоминание о записи!

Мастер: ${booking.service.master.user.firstName} ${booking.service.master.user.lastName}
Услуга: ${booking.service.name}
Дата: ${bookingDate}
`;
      await sendTelegramMessage(booking.user.telegramId, clientMessage);
    }

    if (booking.service.master.user.telegramId) {
      const masterMessage = `
⏰ Напоминание о клиенте!

Клиент: ${booking.user.firstName} ${booking.user.lastName}
Услуга: ${booking.service.name}
Дата: ${bookingDate}
`;
      await sendTelegramMessage(booking.service.master.user.telegramId, masterMessage);
    }
  } catch (error) {
    console.error('Failed to send reminder notifications:', error);
  }
}

function getBookingStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    PENDING: 'Ожидает подтверждения',
    CONFIRMED: 'Подтверждена',
    CANCELED: 'Отменена',
    COMPLETED: 'Завершена',
  };
  return statusTexts[status] || status;
}