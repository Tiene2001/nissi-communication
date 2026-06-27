'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import api from '@/lib/api'

interface Stats {
  projects:   { total: number; published: number }
  services:   { total: number }
  clients:    { total: number }
  messages:   { total: number; unread: number }
  categories: { total: number }
}

const EMPTY: Stats = {
  projects:   { total: 0, published: 0 },
  services:   { total: 0 },
  clients:    { total: 0 },
  messages:   { total: 0, unread: 0 },
  categories: { total: 0 },
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats,   setStats]   = useState<Stats>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    Promise.all([
      api.get('/api/admin/projects').catch(() => ({ data: [] })),
      api.get('/api/admin/services').catch(() => ({ data: [] })),
      api.get('/api/admin/clients').catch(() => ({ data: [] })),
      api.get('/api/admin/contact').catch(() => ({ data: [] })),
      api.get('/api/admin/categories').catch(() => ({ data: [] })),
    ]).then(([projects, services, clients, messages, categories]) => {
      const pList = Array.isArray(projects.data)  ? projects.data  : (projects.data?.data  ?? [])
      const mList = Array.isArray(messages.data)  ? messages.data  : (messages.data?.data  ?? [])
      setStats({
        projects:   { total: pList.length, published: pList.filter((p: any) => p.published).length },
        services:   { total: Array.isArray(services.data)   ? services.data.length   : 0 },
        clients:    { total: Array.isArray(clients.data)    ? clients.data.length    : 0 },
        messages:   { total: mList.length, unread: mList.filter((m: any) => !m.read).length },
        categories: { total: Array.isArray(categories.data) ? categories.data.length : 0 },
      })
    }).finally(() => setLoading(false))
  }, [session])

  const email = session?.user?.email ?? ''

  const cards = [
    {
      label:  'PROJETS',
      href:   '/admin/projets',
      value:  loading ? '—' : String(stats.projects.total),
      sub:    loading ? '' : `${stats.projects.published} publiés`,
      icon:   'photo_library',
      action: 'Voir tous',
    },
    {
      label:  'SERVICES',
      href:   '/admin/services',
      value:  loading ? '—' : String(stats.services.total),
      sub:    'affichés sur le site',
      icon:   'workspace_premium',
      action: 'Gérer',
    },
    {
      label:  'CLIENTS',
      href:   '/admin/clients',
      value:  loading ? '—' : String(stats.clients.total),
      sub:    'logos partenaires',
      icon:   'business',
      action: 'Gérer',
    },
    {
      label:  'MESSAGES',
      href:   '/admin/contact',
      value:  loading ? '—' : String(stats.messages.total),
      sub:    loading ? '' : stats.messages.unread > 0 ? `${stats.messages.unread} non lu(s)` : 'tous lus',
      icon:   'mail',
      action: 'Voir',
      alert:  !loading && stats.messages.unread > 0,
    },
    {
      label:  'CATÉGORIES',
      href:   '/admin/categories',
      value:  loading ? '—' : String(stats.categories.total),
      sub:    'types de projets',
      icon:   'label',
      action: 'Gérer',
    },
  ]

  return (
    <div>
      <div className="mb-10">
        <p className="label mb-1">TABLEAU DE BORD</p>
        <h1 className="headline-md text-white">
          Bonjour{email ? `, ${email.split('@')[0]}` : ''} <span className="text-brand">.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-12">
        {cards.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="group card p-6 bg-surface-container hover:border-brand/40 transition-colors block"
          >
            <div className="flex items-start justify-between mb-6">
              <span
                className="material-symbols-outlined text-on-surface-muted group-hover:text-brand transition-colors"
                style={{ fontSize: '1.4rem' }}
              >
                {card.icon}
              </span>
              {card.alert && (
                <span className="bg-brand text-black text-[10px] font-bold px-2 py-0.5 uppercase">
                  Nouveau
                </span>
              )}
            </div>
            <p className="label mb-1">{card.label}</p>
            <p className="font-headline font-bold text-white text-4xl leading-none mb-2">
              {card.value}
            </p>
            {card.sub && (
              <p className="font-body text-on-surface-muted text-xs">{card.sub}</p>
            )}
            <p className="font-body text-brand text-xs uppercase tracking-widest mt-5 group-hover:underline">
              {card.action} →
            </p>
          </Link>
        ))}
      </div>

      {/* Actions rapides */}
      <div>
        <p className="label mb-4">ACTIONS RAPIDES</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/projets/nouveau" className="btn-primary text-sm py-3 px-6">
            + Nouveau projet
          </Link>
          <Link href="/admin/services" className="btn-secondary text-sm py-3 px-6">
            + Nouveau service
          </Link>
          <Link href="/admin/clients" className="btn-secondary text-sm py-3 px-6">
            + Ajouter un client
          </Link>
        </div>
      </div>
    </div>
  )
}
