'use client'
import { useEffect, useState } from 'react'

export default function ArrivalOverlay() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading]   = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (new URLSearchParams(window.location.search).get('entered') !== '1') return

    setVisible(true)
    const t = setTimeout(() => setFading(true), 80)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none bg-[#050505]"
      style={{
        opacity:    fading ? 0 : 1,
        transition: 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    />
  )
}
