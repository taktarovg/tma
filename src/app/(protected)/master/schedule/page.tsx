// src/app/(protected)/master/schedule/page.tsx - update
'use client'

import { MasterWorkspace } from '@/components/schedule/MasterWorkspace'

export default function MasterSchedulePage() {
  return (
    <div className="container max-w-6xl mx-auto p-4">
      <MasterWorkspace />
    </div>
  )
}