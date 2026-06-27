'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import api from '@/lib/api'

interface User {
  id: string
  email: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  createdAt: string
  lastLogin?: string
}

export default function AdminUtilisateursPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const userRole = (session?.user as any)?.role

  useEffect(() => {
    if (userRole !== 'SUPER_ADMIN') return
    api.get('/api/admin/users')
      .then(r => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userRole])

  if (userRole && userRole !== 'SUPER_ADMIN') {
    return (
      <div className="card p-12 text-center bg-surface-container">
        <p className="label text-red-400">Accès réservé aux Super Administrateurs</p>
      </div>
    )
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await api.post('/api/admin/users', form)
      setUsers(prev => [...prev, res.data])
      setShowForm(false)
      setForm({ email: '', password: '', role: 'ADMIN' })
    } catch {
      setError('Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      await api.delete(`/api/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label mb-1">SUPER ADMIN</p>
          <h1 className="headline-md text-white">Utilisateurs</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-3 px-6">
          + NOUVEL UTILISATEUR
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-8 bg-surface-container mb-8 space-y-6">
          <h2 className="label">CRÉER UN COMPTE</h2>
          <div>
            <label className="label block mb-2">EMAIL</label>
            <input
              type="email"
              value={form.email}
              required
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body"
            />
          </div>
          <div>
            <label className="label block mb-2">MOT DE PASSE</label>
            <input
              type="password"
              value={form.password}
              required
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body"
            />
          </div>
          <div>
            <label className="label block mb-2">RÔLE</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as 'ADMIN' | 'SUPER_ADMIN' }))}
              className="w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          {error && <p className="text-red-400 font-body text-sm">{error}</p>}
          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary text-sm py-3 px-6">
              {saving ? 'Création...' : 'Créer'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm py-3 px-6">
              Annuler
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
            <div className="label col-span-2">EMAIL</div>
            <div className="label">RÔLE</div>
            <div className="label">ACTIONS</div>
          </div>
          {users.map(user => (
            <div key={user.id} className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 hover:bg-surface-container transition-colors items-center">
              <div className="col-span-2">
                <p className="font-body text-white text-sm">{user.email}</p>
                {user.lastLogin && (
                  <p className="font-body text-on-surface-muted text-xs">
                    Dernière connexion : {new Date(user.lastLogin).toLocaleDateString('fr')}
                  </p>
                )}
              </div>
              <div>
                <span className={`font-body font-bold text-xs uppercase px-2 py-1 ${
                  user.role === 'SUPER_ADMIN' ? 'bg-brand/20 text-brand' : 'bg-white/5 text-on-surface-muted'
                }`}>
                  {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
              <div>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="font-body text-xs text-on-surface-muted hover:text-red-400 transition-colors uppercase"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {!users.length && (
            <div className="p-12 text-center">
              <p className="label text-on-surface-muted">Aucun utilisateur</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
