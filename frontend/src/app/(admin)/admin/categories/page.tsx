'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import api from '@/lib/api'

interface Category {
  id:    string
  name:  string
  slug:  string
  _count?: { projects: number }
}

export default function AdminCategoriesPage() {
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<Category | null>(null)
  const [form, setForm]             = useState({ name: '', slug: '' })
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  const load = () => {
    api.get('/api/admin/categories')
      .then(r => setCategories(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (session) load() }, [session])

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug })
    setError('')
    setShowForm(true)
  }

  const handleNameChange = (name: string) =>
    setForm(f => ({ ...f, name, slug: editing ? f.slug : generateSlug(name) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.patch(`/api/admin/categories/${editing.id}`, form)
      } else {
        await api.post('/api/admin/categories', form)
      }
      setShowForm(false)
      setEditing(null)
      load()
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return
    await api.delete(`/api/admin/categories/${id}`)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label mb-1">GESTION</p>
          <h1 className="headline-md text-white">Catégories</h1>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-3 px-6">
          + NOUVELLE CATÉGORIE
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-8 bg-surface-container mb-8 space-y-6">
          <h2 className="label">{editing ? 'MODIFIER' : 'CRÉER'} UNE CATÉGORIE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label block mb-2">NOM *</label>
              <input
                type="text"
                value={form.name}
                required
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Stratégie de marque"
                className="w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body"
              />
            </div>
            <div>
              <label className="label block mb-2">SLUG *</label>
              <input
                type="text"
                value={form.slug}
                required
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="strategie-de-marque"
                className="w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body font-mono text-sm"
              />
            </div>
          </div>
          {error && <p className="text-red-400 font-body text-sm">{error}</p>}
          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary text-sm py-3 px-6">
              {saving ? 'SAUVEGARDE...' : editing ? 'METTRE À JOUR' : 'CRÉER'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditing(null) }}
              className="btn-secondary text-sm py-3 px-6"
            >
              ANNULER
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="card p-12 text-center bg-surface-container">
          <p className="label">Chargement...</p>
        </div>
      ) : (
        <div className="border border-white/10">
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 bg-surface-container">
            <div className="label col-span-2">NOM</div>
            <div className="label">PROJETS</div>
            <div className="label">ACTIONS</div>
          </div>
          {categories.map(cat => (
            <div
              key={cat.id}
              className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 hover:bg-surface-container transition-colors items-center"
            >
              <div className="col-span-2">
                <p className="font-body font-bold text-white text-sm">{cat.name}</p>
                <p className="font-body text-on-surface-muted text-xs font-mono">{cat.slug}</p>
              </div>
              <div>
                <span className="font-body text-on-surface-muted text-sm">
                  {cat._count?.projects ?? 0}
                </span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => openEdit(cat)}
                  className="font-body text-xs text-on-surface-muted hover:text-brand transition-colors uppercase"
                >
                  Éditer
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="font-body text-xs text-on-surface-muted hover:text-red-400 transition-colors uppercase"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {!categories.length && (
            <div className="p-12 text-center">
              <p className="label text-on-surface-muted">Aucune catégorie</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
