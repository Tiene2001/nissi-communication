'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import api from '@/lib/api'

const navItems = [
  { href: '/admin',            label: 'Dashboard',     icon: 'space_dashboard'    },
  { href: '/admin/projets',    label: 'Projets',       icon: 'photo_library'      },
  { href: '/admin/categories', label: 'Catégories',    icon: 'label'              },
  { href: '/admin/services',   label: 'Services',      icon: 'workspace_premium'  },
  { href: '/admin/clients',    label: 'Clients',       icon: 'business'           },
  { href: '/admin/contenu',    label: 'Contenu pages', icon: 'edit_note'          },
  { href: '/admin/contact',    label: 'Messages',      icon: 'mail'               },
]

const superAdminItems = [
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'manage_accounts' },
  { href: '/admin/parametres',   label: 'Paramètres',   icon: 'settings'        },
]

interface Props { userRole: string }

function NavLink({ href, label, icon, active, badge }: {
  href: string; label: string; icon: string; active: boolean; badge?: number
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-4 py-2.5 font-body text-sm transition-colors border-l-2 ${
        active
          ? 'text-white bg-white/5 border-brand'
          : 'text-on-surface-muted hover:text-white hover:bg-white/[0.03] border-transparent'
      }`}
    >
      <span
        className={`material-symbols-outlined transition-colors ${active ? 'text-brand' : 'text-on-surface-muted group-hover:text-white'}`}
        style={{ fontSize: '1.15rem' }}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="bg-brand text-black text-[10px] font-bold leading-none px-1.5 py-0.5 min-w-[18px] text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}

export default function AdminSidebar({ userRole }: Props) {
  const pathname  = usePathname()
  const { data: session } = useSession()
  const [unread, setUnread] = useState(0)
  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  useEffect(() => {
    if (!session) return
    const fetch = () => {
      api.get('/api/admin/contact')
        .then(r => {
          const msgs = Array.isArray(r.data) ? r.data : []
          setUnread(msgs.filter((m: any) => !m.read).length)
        })
        .catch(() => {})
    }
    fetch()
    const interval = setInterval(fetch, 30_000)
    return () => clearInterval(interval)
  }, [session])

  // Réinitialise le badge quand on consulte la page Messages
  useEffect(() => {
    if (pathname === '/admin/contact') setUnread(0)
  }, [pathname])

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container border-r border-white/10 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex flex-col items-start gap-2">
        <Image
          src="/images/logo_nissi_blanc.png"
          alt="NISSI Communication"
          width={140}
          height={40}
          className="object-contain object-left"
          priority
        />
        <div className="font-body text-on-surface-muted text-[11px] uppercase tracking-widest">Administration</div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
            badge={item.href === '/admin/contact' ? unread : undefined}
          />
        ))}

        {userRole === 'SUPER_ADMIN' && (
          <>
            <div className="py-3 px-4">
              <div className="h-px bg-white/10" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-muted mt-3 mb-1 pl-0">Super Admin</p>
            </div>
            {superAdminItems.map(item => (
              <NavLink key={item.href} {...item} active={isActive(item.href)} />
            ))}
          </>
        )}
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-on-surface-muted hover:text-red-400 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.15rem' }}>logout</span>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
