// src/app/api/categories/route.ts - update
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Получаем все родительские категории с их детьми
        const categories = await prisma.category.findMany({
            where: {
                parentId: null  // только родительские категории
            },
            include: {
                children: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
            orderBy: {
                order: 'asc'
            }
        })

        console.log('API: Fetched categories structure:', categories)
        return NextResponse.json(categories)
    } catch (error) {
        console.error('Failed to fetch categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}