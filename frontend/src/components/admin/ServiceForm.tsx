'use client'
import { useState } from 'react'
import api from '@/lib/api'
import IconPicker from './IconPicker'

interface ServiceData {
  title: string
  description: string
  icon: string
}

interface Props {
  initialData?: any
  onSaved: () => void
  onCancel: () => void
}

export default function ServiceForm({ initialData, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<ServiceData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    icon: initialData?.icon || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (initialData?.id) {
        await api.patch(`/api/admin/services/${initialData.id}`, form)
      } else {
        await api.post('/api/admin/services', form)
      }
      onSaved()
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label block mb-2">TITRE *</label>
          <input
            type="text"
            value={form.title}
            required
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body"
          />
        </div>
        <div>
          <label className="label block mb-2">ICÔNE</label>
          <IconPicker
            value={form.icon}
            onChange={icon => setForm(f => ({ ...f, icon }))}
          />
        </div>
      </div>
      <div>
        <label className="label block mb-2">DESCRIPTION *</label>
        <textarea
          rows={4}
          value={form.description}
          required
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body resize-none"
        />
      </div>
      {error && <p className="text-red-400 font-body text-sm">{error}</p>}
      <div className="flex gap-4">
        <button type="submit" disabled={saving} className="btn-primary text-sm py-3 px-6">
          {saving ? 'SAUVEGARDE...' : initialData ? 'METTRE À JOUR' : 'CRÉER'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm py-3 px-6">
          ANNULER
        </button>
      </div>
    </form>
  )
}
