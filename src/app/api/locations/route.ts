// src/app/api/locations/route.ts - update
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [cities, districts] = await Promise.all([
      prisma.city.findMany({
        orderBy: { name: 'asc' }
      }),
      prisma.district.findMany({
        orderBy: { name: 'asc' },
        include: {
          city: true
        }
      })
    ])

    console.log('Fetched locations:', { cities, districts })

    return NextResponse.json({ cities, districts })
  } catch (error) {
    console.error('Failed to fetch locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}