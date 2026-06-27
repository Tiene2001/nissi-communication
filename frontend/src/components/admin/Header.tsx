'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import NotificationBadge from './NotificationBadge'

export default function AdminHeader() {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ''
  const role  = (session?.user as any)?.role

  return (
    <header className="sticky top-0 z-40 flex items-center justify-end gap-6 px-8 py-4 border-b border-white/10 bg-surface-container/80 backdrop-blur-sm">
      <NotificationBadge />
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-brand/20 border border-brand/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-brand" style={{ fontSize: '0.9rem' }}>person</span>
        </div>
        <div className="text-right">
          <p className="font-body text-on-surface text-xs">{email}</p>
          {role && (
            <p className="font-body text-on-surface-muted text-[10px] uppercase tracking-widest">
              {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
