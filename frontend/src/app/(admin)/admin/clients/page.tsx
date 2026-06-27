'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ClientForm from '@/components/admin/ClientForm'
import api from '@/lib/api'

interface Client {
  id: string
  name: string
  logo: string
  order: number
}

export default function AdminClientsPage() {
  const { data: session } = useSession()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)

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
          {clients.map(client => (
            <div key={client.id} className="card p-6 bg-surface-container text-center">
              <img src={client.logo} alt={client.name} className="h-12 w-auto object-contain mx-auto mb-4 filter grayscale" />
              <p className="font-body text-on-surface-muted text-xs mb-4">{client.name}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => { setEditing(client); setShowForm(false) }}
                  className="font-body text-xs text-on-surface-muted hover:text-brand transition-colors uppercase"
                >
                  Éditer
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="font-body text-xs text-on-surface-muted hover:text-red-400 transition-colors uppercase"
                >
                  Supp.
                </button>
              </div>
            </div>
          ))}
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
