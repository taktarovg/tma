// src/app/api/master/schedule/route.ts

export const dynamic = 'force-dynamic'

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { startOfMonth, endOfMonth, parse } from 'date-fns';

export async function GET(request: NextRequest) { // Обновили тип с Request на NextRequest
  try {
    const session = await getSession(request); // Передаем request в getSession
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');

    let startDate: Date;
    let endDate: Date;

    if (monthParam) {
      const monthDate = parse(monthParam, 'yyyy-MM', new Date());
      startDate = startOfMonth(monthDate);
      endDate = endOfMonth(monthDate);
    } else {
      const now = new Date();
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }

    const masterProfile = await prisma.masterProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!masterProfile) {
      return NextResponse.json({ error: 'Master profile not found' }, { status: 404 });
    }

    // Получаем все дни с расписанием для текущего месяца
    const schedules = await prisma.daySchedule.findMany({
      where: {
        masterId: masterProfile.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Schedules fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}