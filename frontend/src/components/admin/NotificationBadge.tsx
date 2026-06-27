'use client'
import { useSSE } from '@/hooks/useSSE'
import Link from 'next/link'

export default function NotificationBadge() {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const messages = useSSE(`${API}/api/contact/stream`)
  const count = messages.filter((m: any) => m.type === 'new_message').length

  if (count === 0) return null

  return (
    <Link href="/admin/contact" className="relative inline-flex items-center">
      <span className="font-body text-on-surface-muted text-sm hover:text-brand transition-colors">
        Messages
      </span>
      <span className="ml-2 bg-brand text-black font-bold text-xs px-2 py-0.5">
        {count}
      </span>
    </Link>
  )
}
