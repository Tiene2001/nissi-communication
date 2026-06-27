'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MediaUpload from './MediaUpload'
import api from '@/lib/api'

const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
function resolveUrl(url: string) {
  return url?.startsWith('/') ? `${PUBLIC_API}${url}` : url
}

interface Result   { label: string; value: string }
interface MediaItem { url: string; type: string; order: number }

interface ProjectData {
  title:       string
  slug:        string
  category:    string
  clientName:  string
  date:        string
  description: string
  published:   boolean
  media:       MediaItem[]
  results:     Result[]
}

interface Props {
  initialData?: any
  projectId?:   string
}

export default function ProjectForm({ initialData, projectId }: Props) {
  const router  = useRouter()
  const [form, setForm] = useState<ProjectData>({
    title:       initialData?.title       || '',
    slug:        initialData?.slug        || '',
    category:    initialData?.category    || '',
    clientName:  initialData?.clientName  || '',
    date:        initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
    description: initialData?.description || '',
    published:   initialData?.published   || false,
    media:       initialData?.media       || [],
    results:     initialData?.results     || [],
  })
  const [categories, setCategories] = useState<string[]>([])
  const [saving, setSaving]         = useState(false)
  const [error,  setError]          = useState('')

  useEffect(() => {
    api.get('/api/admin/categories')
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : []
        setCategories(list.map((c: any) => c.name))
      })
      .catch(() => {})
  }, [])

  const generateSlug = (title: string) =>
    title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setForm(f => ({ ...f, title, ...(!projectId ? { slug: generateSlug(title) } : {}) }))
  }

  const handleMediaUploaded = (url: string, type: 'IMAGE' | 'VIDEO') =>
    setForm(f => ({ ...f, media: [...f.media, { url, type, order: f.media.length }] }))

  const handleRemoveMedia = (index: number) =>
    setForm(f => ({ ...f, media: f.media.filter((_, i) => i !== index) }))

  const addResult = () =>
    setForm(f => ({ ...f, results: [...f.results, { label: '', value: '' }] }))

  const updateResult = (index: number, field: 'label' | 'value', val: string) =>
    setForm(f => ({ ...f, results: f.results.map((r, i) => i === index ? { ...r, [field]: val } : r) }))

  const removeResult = (index: number) =>
    setForm(f => ({ ...f, results: f.results.filter((_, i) => i !== index) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // Seuls les champs du DTO sont envoyés (slug auto-généré côté backend)
      const payload = {
        title:       form.title,
        description: form.description,
        category:    form.category,
        clientName:  form.clientName,
        date:        form.date,
        published:   form.published,
      }

      let id = projectId
      if (id) {
        await api.patch(`/api/admin/projects/${id}`, payload)
      } else {
        const created = await api.post('/api/admin/projects', payload)
        id = created.data.id
      }

      // Sauvegarde des médias séparément
      if (id && form.media.length > 0) {
        await api.post(`/api/admin/projects/${id}/media/replace`, {
          items: form.media.map((m, i) => ({ url: m.url, type: m.type, order: i })),
        })
      } else if (id && projectId) {
        // Mise à jour sans médias → on vide
        await api.post(`/api/admin/projects/${id}/media/replace`, { items: [] })
      }

      router.push('/admin/projets')
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-surface-container border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl">

      {/* ── Infos de base ── */}
      <section>
        <p className="label mb-6">INFORMATIONS GÉNÉRALES</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label block mb-2">TITRE *</label>
            <input type="text" value={form.title} required onChange={handleTitleChange} className={inputCls} />
          </div>
          <div>
            <label className="label block mb-2">SLUG *</label>
            <input
              type="text" value={form.slug} required
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className={`${inputCls} font-mono text-sm`}
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="label block mb-2">CATÉGORIE *</label>
            {categories.length > 0 ? (
              <select
                value={form.category}
                required
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className={inputCls}
              >
                <option value="">— Choisir —</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input
                type="text" value={form.category} required
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Stratégie de marque..."
                className={inputCls}
              />
            )}
          </div>

          <div>
            <label className="label block mb-2">CLIENT</label>
            <input
              type="text" value={form.clientName}
              onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="label block mb-2">DATE *</label>
            <input
              type="date" value={form.date} required
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-3 pt-8">
            <input
              type="checkbox" id="published" checked={form.published}
              onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
              className="w-4 h-4 accent-brand"
            />
            <label htmlFor="published" className="label cursor-pointer">PUBLIÉ</label>
          </div>
        </div>
      </section>

      {/* ── Description ── */}
      <section>
        <p className="label mb-4">DESCRIPTION *</p>
        <textarea
          rows={6} value={form.description} required
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className={`${inputCls} resize-none`}
        />
      </section>

      {/* ── Résultats / Métriques ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="label">RÉSULTATS & MÉTRIQUES</p>
          <button type="button" onClick={addResult} className="font-body text-xs text-brand hover:underline uppercase">
            + Ajouter
          </button>
        </div>
        <p className="font-body text-on-surface-muted text-xs mb-5">
          Affichés sous forme de chiffres clés sur la page du projet (ex. : "Audience" / "12 000")
        </p>
        {form.results.length === 0 && (
          <div className="border border-dashed border-white/10 p-6 text-center">
            <p className="label text-on-surface-muted text-xs">Aucun résultat — cliquer sur « Ajouter »</p>
          </div>
        )}
        <div className="space-y-3">
          {form.results.map((r, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 items-center">
              <div className="col-span-2">
                <input
                  type="text" value={r.label} placeholder="Label (ex. Audience)"
                  onChange={e => updateResult(i, 'label', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text" value={r.value} placeholder="Valeur (ex. 12 000)"
                  onChange={e => updateResult(i, 'value', e.target.value)}
                  className={inputCls}
                />
              </div>
              <button
                type="button" onClick={() => removeResult(i)}
                className="font-body text-xs text-on-surface-muted hover:text-red-400 transition-colors uppercase text-center"
              >
                Suppr.
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Médias ── */}
      <section>
        <p className="label mb-4">MÉDIAS (IMAGES & VIDÉOS)</p>
        <MediaUpload onUploaded={handleMediaUploaded} />
        {form.media.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {form.media.map((m, i) => (
              <div key={i} className="relative border border-white/10 group">
                {m.type === 'VIDEO' ? (
                  <div className="h-24 bg-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-brand" style={{ fontSize: '2rem' }}>play_circle</span>
                  </div>
                ) : (
                  <img src={resolveUrl(m.url)} alt="" className="h-24 w-full object-cover" />
                )}
                <button
                  type="button" onClick={() => handleRemoveMedia(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <div className="absolute bottom-1 left-1">
                  <span className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 font-bold uppercase">
                    {m.type === 'VIDEO' ? 'Vidéo' : 'Image'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <p className="text-red-400 font-body text-sm">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? 'SAUVEGARDE...' : projectId ? 'METTRE À JOUR' : 'CRÉER LE PROJET'}
        </button>
        <button type="button" onClick={() => router.push('/admin/projets')} className="btn-secondary text-sm">
          ANNULER
        </button>
      </div>
    </form>
  )
}
