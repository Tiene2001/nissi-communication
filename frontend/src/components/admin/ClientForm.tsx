'use client'
import { useState } from 'react'
import api from '@/lib/api'
import LogoUpload from './LogoUpload'

const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
function resolveUrl(url: string) {
  return url?.startsWith('/') ? `${PUBLIC_API}${url}` : url
}

interface ClientData {
  name: string
  logo: string
}

interface Props {
  initialData?: any
  onSaved:  () => void
  onCancel: () => void
}

export default function ClientForm({ initialData, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<ClientData>({
    name: initialData?.name || '',
    logo: initialData?.logo || '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const handleLogoUploaded = (url: string) => setForm(f => ({ ...f, logo: url }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (initialData?.id) {
        await api.patch(`/api/admin/clients/${initialData.id}`, form)
      } else {
        await api.post('/api/admin/clients', form)
      }
      onSaved()
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="label block mb-2">NOM DU CLIENT *</label>
        <input
          type="text" value={form.name} required
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={inputCls}
        />
      </div>

      {/* Logo */}
      <div>
        <label className="label block mb-3">LOGO *</label>
        {form.logo ? (
          <div className="flex items-center gap-6">
            <div className="border border-white/10 p-4 bg-surface-highest">
              <img
                src={resolveUrl(form.logo)} alt={form.name}
                className="h-14 w-auto object-contain filter grayscale"
              />
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, logo: '' }))}
              className="font-body text-xs text-on-surface-muted hover:text-red-400 transition-colors uppercase"
            >
              Remplacer
            </button>
          </div>
        ) : (
          <LogoUpload onUploaded={handleLogoUploaded} />
        )}
      </div>

      {error && <p className="text-red-400 font-body text-sm">{error}</p>}

      <div className="flex gap-4">
        <button type="submit" disabled={saving || !form.logo} className="btn-primary text-sm py-3 px-6">
          {saving ? 'SAUVEGARDE...' : initialData ? 'METTRE À JOUR' : 'AJOUTER'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm py-3 px-6">
          ANNULER
        </button>
      </div>
    </form>
  )
}
