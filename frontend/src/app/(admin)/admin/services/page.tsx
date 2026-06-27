'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ServiceForm from '@/components/admin/ServiceForm'
import api from '@/lib/api'

interface Service {
  id: string
  title: string
  description: string
  icon?: string
  order: number
}

export default function AdminServicesPage() {
  const { data: session } = useSession()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)

  const loadServices = () => {
    api.get('/api/admin/services')
      .then(r => setServices(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (session) loadServices()
  }, [session])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce service ?')) return
    await api.delete(`/api/admin/services/${id}`)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditing(null)
    loadServices()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label mb-1">GESTION</p>
          <h1 className="headline-md text-white">Services</h1>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="btn-primary text-sm py-3 px-6"
        >
          + NOUVEAU SERVICE
        </button>
      </div>

      {(showForm || editing) && (
        <div className="card p-8 bg-surface-container mb-8">
          <h2 className="label mb-6">{editing ? 'MODIFIER' : 'CRÉER'} UN SERVICE</h2>
          <ServiceForm
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div key={service.id} className="card p-6 bg-surface-container">
              {service.icon && <div className="text-brand text-2xl mb-4">{service.icon}</div>}
              <h3 className="font-headline font-bold text-white mb-2">{service.title}</h3>
              <p className="font-body text-on-surface-muted text-sm leading-relaxed mb-6">{service.description}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => { setEditing(service); setShowForm(false) }}
                  className="font-body text-xs text-on-surface-muted hover:text-brand transition-colors uppercase"
                >
                  Éditer
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="font-body text-xs text-on-surface-muted hover:text-red-400 transition-colors uppercase"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {!services.length && !showForm && (
            <div className="col-span-3 card p-12 text-center bg-surface-container">
              <p className="label text-on-surface-muted">Aucun service</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
