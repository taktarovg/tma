//  src/app/api/upload.ts


import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

// Указываем runtime (опционально, по умолчанию 'nodejs')
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${Date.now()}-${file.name}`;
  const path = join(process.cwd(), 'public/uploads', fileName);

  // Сохраняем оригинальный файл
  await writeFile(path, buffer);
  // Оптимизируем в WebP
  const optimized = await sharp(buffer).webp({ quality: 80 }).toBuffer();
  const webpPath = path.replace(/\.[^/.]+$/, '.webp');
  await writeFile(webpPath, optimized);

  return NextResponse.json({ url: `/uploads/${fileName.replace(/\.[^/.]+$/, '.webp')}` });
}