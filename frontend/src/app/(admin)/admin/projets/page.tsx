'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import api from '@/lib/api'

interface Project {
  id: string
  title: string
  slug: string
  category: string
  clientName?: string
  published: boolean
  createdAt: string
}

export default function AdminProjetsPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    api.get('/api/admin/projects')
      .then(r => setProjects(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce projet ?')) return
    try {
      await api.delete(`/api/admin/projects/${id}`)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const handleTogglePublish = async (id: string, published: boolean) => {
    try {
      await api.patch(`/api/admin/projects/${id}`, { published: !published })
      setProjects(prev => prev.map(p => p.id === id ? { ...p, published: !published } : p))
    } catch {
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label mb-1">GESTION</p>
          <h1 className="headline-md text-white">Projets</h1>
        </div>
        <Link href="/admin/projets/nouveau" className="btn-primary text-sm py-3 px-6">
          + NOUVEAU PROJET
        </Link>
      </div>

      {loading ? (
        <div className="card p-12 text-center bg-surface-container">
          <p className="label">Chargement...</p>
        </div>
      ) : (
        <div className="border border-white/10">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 bg-surface-container">
            <div className="label col-span-2">TITRE</div>
            <div className="label">CATÉGORIE</div>
            <div className="label">STATUT</div>
            <div className="label">ACTIONS</div>
          </div>
          {projects.map(project => (
            <div key={project.id} className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 hover:bg-surface-container transition-colors items-center">
              <div className="col-span-2">
                <p className="font-body font-bold text-white text-sm">{project.title}</p>
                {project.clientName && <p className="font-body text-on-surface-muted text-xs">{project.clientName}</p>}
              </div>
              <div>
                <span className="label text-on-surface-muted">{project.category}</span>
              </div>
              <div>
                <button
                  onClick={() => handleTogglePublish(project.id, project.published)}
                  className={`font-body font-bold text-xs uppercase px-3 py-1 transition-colors ${
                    project.published
                      ? 'bg-brand/20 text-brand border border-brand/30 hover:bg-brand/30'
                      : 'bg-white/5 text-on-surface-muted border border-white/10 hover:border-white/30'
                  }`}
                >
                  {project.published ? 'Publié' : 'Brouillon'}
                </button>
              </div>
              <div className="flex gap-3">
                <Link href={`/admin/projets/${project.id}`} className="font-body text-xs text-on-surface-muted hover:text-brand transition-colors uppercase">
                  Éditer
                </Link>
                <button onClick={() => handleDelete(project.id)} className="font-body text-xs text-on-surface-muted hover:text-red-400 transition-colors uppercase">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {!projects.length && (
            <div className="p-12 text-center">
              <p className="label text-on-surface-muted">Aucun projet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
