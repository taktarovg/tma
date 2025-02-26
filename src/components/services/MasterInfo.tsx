// src/components/services/MasterInfo.tsx
'use client'

import { Avatar } from '@/components/ui/Avatar'

interface MasterInfoProps {
  master: {
    user: {
      firstName: string
      lastName: string
      username?: string
      avatar?: string | null
    }
  }
}

export function MasterInfo({ master }: MasterInfoProps) {
  return (
    <div className="mt-4 flex items-center gap-3 py-3 border-t border-b">
      <Avatar
        src={master.user.avatar || undefined}
        alt={master.user.firstName}
        fallback={(master.user.firstName[0] || '?').toUpperCase()}
        className="w-10 h-10"
      />
      <div>
        <div className="font-medium">
          {master.user.firstName} {master.user.lastName}
        </div>
        {master.user.username && (
          <div className="text-sm text-gray-500">
            @{master.user.username}
          </div>
        )}
      </div>
    </div>
  )
}