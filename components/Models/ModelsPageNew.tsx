import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

const ModelsPageClient = dynamic(() => import('./ModelsPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🤖</div>
        <div className="text-lg">Loading AI Models...</div>
      </div>
    </div>
  ),
})

interface ModelsPageProps {
  className?: string
}

export default function ModelsPage({ className }: ModelsPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🤖</div>
          <div className="text-lg">Loading AI Models...</div>
        </div>
      </div>
    }>
      <ModelsPageClient className={className} />
    </Suspense>
  )
}
