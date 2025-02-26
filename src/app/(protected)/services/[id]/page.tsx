// src/app/(protected)/services/[id]/page.tsx - update
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ServiceDetail } from '@/components/services/ServiceDetail'

interface ServicePageProps {
  params: {
    id: string
  }
}

async function getService(id: string) {
  try {
    console.log('Fetching service with ID:', id)
    const serviceId = parseInt(id)
    
    if (isNaN(serviceId)) {
      console.log('Invalid service ID:', id)
      return null
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        master: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                isPremium: true,
                avatar: true,
                username: true
              }
            },
            city: true,
            district: true,
            settings: true,
            daySchedules: {
              where: {
                date: {
                  gte: new Date()
                }
              },
              take: 1,
              orderBy: {
                date: 'asc'
              }
            }
          }
        },
        category: {
          include: {
            parent: true
          }
        },
        _count: {
          select: {
            favorites: true
          }
        }
      }
    })

    console.log('Found service:', service ? 'yes' : 'no')

    if (!service) {
      return null
    }

    // Увеличиваем счетчик просмотров
    await prisma.service.update({
      where: { id: service.id },
      data: { viewsCount: { increment: 1 } }
    })

    // Преобразуем Decimal в string для price
    const transformedService = {
      ...service,
      price: service.price.toString(),
      master: {
        ...service.master,
        workSchedule: service.master.daySchedules[0] ? {
          workHours: service.master.daySchedules[0].workHours,
          breaks: service.master.daySchedules[0].breaks,
          workDays: {
            "1": true, "2": true, "3": true, "4": true, "5": true, "6": false, "7": false
          }
        } : null,
      },
      favoritesCount: service._count.favorites
    }

    return transformedService
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  console.log('Rendering service page for ID:', params.id)
  const service = await getService(params.id)

  if (!service) {
    console.log('Service not found, returning 404')
    return notFound()
  }

  return (
    <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
      <ServiceDetail service={service} />
    </Suspense>
  )
}