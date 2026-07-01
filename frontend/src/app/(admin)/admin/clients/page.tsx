'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ClientForm from '@/components/admin/ClientForm'
import api from '@/lib/api'

const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
function resolveUrl(url: string) {
  return url?.startsWith('/') ? `${PUBLIC_API}${url}` : url
}

interface Client {
  id: string
  name: string
  logo: string
  order: number
}

export default function AdminClientsPage() {
  const { data: session } = useSession()
  const [clients,    setClients]    = useState<Client[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState<Client | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  const loadClients = () => {
    api.get('/api/admin/clients')
      .then(r => setClients(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (session) loadClients()
  }, [session])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return
    try {
      await api.delete(`/api/admin/clients/${id}`)
      setClients(prev => prev.filter(c => c.id !== id))
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const handleReprocess = async (client: Client) => {
    setProcessing(client.id)
    try {
      // Récupérer le logo existant comme blob
      const fetchRes = await fetch(resolveUrl(client.logo))
      const blob = await fetchRes.blob()
      const file = new File([blob], 'logo-original', { type: blob.type })

      // Supprimer l'arrière-plan
      const { removeBackground } = await import('@imgly/background-removal')
      const processedBlob = await removeBackground(file, {
        output: { format: 'image/png', quality: 1 },
      })

      // Uploader le PNG transparent
      const processedFile = new File([processedBlob], `logo-${Date.now()}.png`, { type: 'image/png' })
      const formData = new FormData()
      formData.append('file', processedFile)
      const uploadRes = await api.post('/api/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Mettre à jour le client avec la nouvelle URL
      await api.patch(`/api/admin/clients/${client.id}`, { logo: uploadRes.data.url })
      loadClients()
    } catch {
      alert(`Erreur lors du retraitement de "${client.name}"`)
    } finally {
      setProcessing(null)
    }
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditing(null)
    loadClients()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label mb-1">GESTION</p>
          <h1 className="headline-md text-white">Clients — Logos</h1>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="btn-primary text-sm py-3 px-6"
        >
          + AJOUTER UN CLIENT
        </button>
      </div>

      {(showForm || editing) && (
        <div className="card p-8 bg-surface-container mb-8">
          <h2 className="label mb-6">{editing ? 'MODIFIER' : 'AJOUTER'} UN CLIENT</h2>
          <ClientForm
            initialData={editing}
            onSaved={handleSaved}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center bg-surface-container">
          <p className="label">Chargement...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {clients.map(client => {
            const isProcessing = processing === client.id
            return (
              <div key={client.id} className="card p-6 bg-surface-container text-center">
                <div className="relative h-12 flex items-center justify-center mb-4">
                  {isProcessing ? (
                    <span className="material-symbols-outlined text-brand animate-spin" style={{ fontSize: '1.5rem' }}>
                      progress_activity
                    </span>
                  ) : (
                    <img
                      src={resolveUrl(client.logo)}
                      alt={client.name}
                      className="h-12 w-auto object-contain mx-auto filter grayscale"
                    />
                  )}
                </div>
                <p className="font-body text-on-surface-muted text-xs mb-1">{client.name}</p>
                {isProcessing && (
                  <p className="font-body text-brand text-[10px] uppercase tracking-widest mb-3">Traitement…</p>
                )}
                {!isProcessing && <div className="mb-3" />}
                <div className="flex justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => { setEditing(client); setShowForm(false) }}
                    disabled={!!processing}
                    className="font-body text-xs text-on-surface-muted hover:text-brand transition-colors uppercase disabled:opacity-40"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => handleReprocess(client)}
                    disabled={!!processing}
                    className="font-body text-xs text-on-surface-muted hover:text-brand transition-colors uppercase disabled:opacity-40"
                    title="Supprimer l'arrière-plan"
                  >
                    ✦ Fond
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    disabled={!!processing}
                    className="font-body text-xs text-on-surface-muted hover:text-red-400 transition-colors uppercase disabled:opacity-40"
                  >
                    Supp.
                  </button>
                </div>
              </div>
            )
          })}
          {!clients.length && !showForm && (
            <div className="col-span-6 card p-12 text-center bg-surface-container">
              <p className="label text-on-surface-muted">Aucun client</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
