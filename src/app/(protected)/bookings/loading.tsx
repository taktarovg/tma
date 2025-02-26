// src/app/(protected)/bookings/loading.tsx - new

import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingPage() {
  return (
    <div className="container max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-40" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-56" />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>

              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}