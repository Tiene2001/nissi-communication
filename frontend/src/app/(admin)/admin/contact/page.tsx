'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import api from '@/lib/api'

interface Message {
  id:        string
  name:      string
  email:     string
  phone?:    string
  subject?:  string
  message:   string
  read:      boolean
  createdAt: string
}

type Filter = 'all' | 'unread' | 'read'

export default function ContactAdminPage() {
  const { data: session }             = useSession()
  const [messages, setMessages]       = useState<Message[]>([])
  const [loading,  setLoading]        = useState(true)
  const [filter,   setFilter]         = useState<Filter>('all')

  const load = () =>
    api.get('/api/admin/contact')
      .then(r => setMessages(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))

  useEffect(() => {
    if (!session) return
    load()
  }, [session])

  // SSE avec token en query param (EventSource ne supporte pas les headers)
  useEffect(() => {
    const token = (session as any)?.accessToken
    if (!token) return

    const API    = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
    const source = new EventSource(`${API}/api/contact/stream?token=${token}`)

    source.onmessage = () => {
      // Recharge la liste complète à chaque nouveau message
      load()
    }
    source.onerror = () => source.close()

    return () => source.close()
  }, [(session as any)?.accessToken])

  const markRead = async (id: string) => {
    try {
      await api.patch(`/api/admin/contact/${id}/read`, {})
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: true } : m))
    } catch {
      alert('Erreur lors de la mise à jour')
    }
  }

  const unreadCount = messages.filter(m => !m.read).length

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.read
    if (filter === 'read')   return  m.read
    return true
  })

  const TABS: { key: Filter; label: string; count: number }[] = [
    { key: 'all',    label: 'Tous',    count: messages.length },
    { key: 'unread', label: 'Non lus', count: unreadCount },
    { key: 'read',   label: 'Lus',     count: messages.length - unreadCount },
  ]

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <p className="label mb-1">MESSAGES DE CONTACT</p>
          <h1 className="headline-md text-white">Demandes reçues</h1>
        </div>
        {unreadCount > 0 && (
          <span className="bg-brand text-black font-bold text-xs px-3 py-1 self-end mb-1">
            {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-1 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 font-body text-xs uppercase tracking-widest transition-colors border ${
              filter === tab.key
                ? 'bg-brand text-black border-brand'
                : 'text-on-surface-muted border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 leading-none ${
              filter === tab.key ? 'bg-black/20' : 'bg-white/10 text-on-surface-muted'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="card p-12 text-center bg-surface-container">
          <p className="label">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(msg => (
            <div
              key={msg.id}
              className={`card p-6 bg-surface-container transition-colors ${!msg.read ? 'border-brand/40' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-headline font-bold text-white">{msg.name}</span>
                    {!msg.read && (
                      <span className="bg-brand text-black text-[10px] px-2 py-0.5 font-bold uppercase">Nouveau</span>
                    )}
                  </div>
                  <p className="font-body text-on-surface-muted text-sm">
                    {msg.email}{msg.phone && ` · ${msg.phone}`}
                  </p>
                  {msg.subject && (
                    <p className="font-body text-brand text-xs mt-1 font-semibold">{msg.subject}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-body text-on-surface-muted text-xs">
                    {new Date(msg.createdAt).toLocaleDateString('fr', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                  {!msg.read && (
                    <button
                      onClick={() => markRead(msg.id)}
                      className="label text-xs text-on-surface-muted hover:text-white transition-colors uppercase"
                    >
                      Marquer lu
                    </button>
                  )}
                </div>
              </div>
              <p className="font-body text-on-surface-muted text-sm mt-4 leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="card p-12 text-center bg-surface-container">
              <p className="label text-on-surface-muted">
                {filter === 'unread' ? 'Aucun message non lu'
                 : filter === 'read' ? 'Aucun message lu'
                 : 'Aucun message'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
