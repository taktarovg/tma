// src/app/api/auth/telegram.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname.endsWith('/check')) {
    try {
      return NextResponse.json({ status: 'ok', message: 'Server is running' }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}