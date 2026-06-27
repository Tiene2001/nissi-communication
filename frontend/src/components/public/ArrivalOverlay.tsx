'use client'
import { useEffect, useState } from 'react'

export default function ArrivalOverlay() {
  const [fading, setFading] = useState(false)
  const [gone, setGone]     = useState(false)

  useEffect(() => {
    const fromEntry = window.location.search.includes('entered=1')

    if (!fromEntry) {
      setGone(true)
      return
    }

    const t1 = setTimeout(() => setFading(true), 120)
    const t2 = setTimeout(() => setGone(true),  1300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (gone) return null

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#050505] pointer-events-none"
      style={{
        opacity:    fading ? 0 : 1,
        transition: fading ? 'opacity 1.1s cubic-bezier(0.16,1,0.3,1)' : 'none',
      }}
    />
  )
}
