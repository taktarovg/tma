// src/app/api/auth/telegram/check/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Здесь можно добавить проверку авторизации или состояния сервера
        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}