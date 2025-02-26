// src/app/api/auth/telegram/check/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Здесь можно добавить проверку авторизации или состояния сервера
        console.log('Telegram API check endpoint called');
        return NextResponse.json({ 
            status: 'ok',
            timestamp: new Date().toISOString() 
        }, { status: 200 });
    } catch (error) {
        console.error('Server check error:', error);
        return NextResponse.json({ 
            error: 'Server error',
            message: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}