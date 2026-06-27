'use client'
import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: 'bg-brand text-black',
    error: 'bg-red-500 text-white',
    info: 'bg-surface-container border border-white/10 text-on-surface',
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 px-6 py-4 font-body font-bold text-sm uppercase tracking-label ${colors[type]}`}>
      {message}
    </div>
  )
}

// Hook de gestion du toast
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  const hide = () => setToast(null)

  return { toast, show, hide }
}
