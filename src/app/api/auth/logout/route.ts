// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
    // Ничего не делаем на сервере, так как токен удаляется на клиенте
    return NextResponse.json({ success: true });
}