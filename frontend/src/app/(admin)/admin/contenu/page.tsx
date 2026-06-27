'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import api from '@/lib/api'

// ── Définition des sections et de leurs champs ─────────────────────────
interface Field {
  key:         string
  label:       string
  type:        'text' | 'textarea'
  placeholder?: string
}

interface SectionDef {
  section:     string
  title:       string
  description: string
  fields:      Field[]
  columns?:    1 | 2
}

const SECTIONS: SectionDef[] = [
  {
    section:     'hero',
    title:       'Section Hero — Qui nous sommes',
    description: "Textes et chiffres clés de la section principale sous l'image d'accueil",
    fields: [
      { key: 'title',        label: 'Titre orange (gauche)',       type: 'text',     placeholder: 'Les esprits de la com' },
      { key: 'description',  label: 'Texte de présentation',       type: 'textarea', placeholder: "Cabinet de conseil…" },
      { key: 'tagline',      label: 'Accroche en italique orange', type: 'text',     placeholder: 'Invoquez les Esprits et prenez le pouvoir !' },
      { key: 'stat1_number', label: 'Chiffre 1',                   type: 'text',     placeholder: '50+' },
      { key: 'stat1_label',  label: 'Label chiffre 1',             type: 'text',     placeholder: 'Projets réalisés' },
      { key: 'stat2_number', label: 'Chiffre 2',                   type: 'text',     placeholder: '30+' },
      { key: 'stat2_label',  label: 'Label chiffre 2',             type: 'text',     placeholder: 'Clients satisfaits' },
      { key: 'stat3_number', label: 'Chiffre 3',                   type: 'text',     placeholder: '5+' },
      { key: 'stat3_label',  label: 'Label chiffre 3',             type: 'text',     placeholder: "Années d'expérience" },
      { key: 'stat4_number', label: 'Chiffre 4',                   type: 'text',     placeholder: '100%' },
      { key: 'stat4_label',  label: 'Label chiffre 4',             type: 'text',     placeholder: 'Engagement client' },
    ],
    columns: 2,
  },
]

type SectionData = Record<string, string>
type AllData     = Record<string, SectionData>

export default function AdminContenuPage() {
  const { data: session } = useSession()
  const [allData,  setAllData]  = useState<AllData>({})
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState<string | null>(null)
  const [saved,    setSaved]    = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    api.get('/api/admin/content')
      .then(r => {
        const map: AllData = {}
        const rows: { section: string; data: SectionData }[] = r.data
        rows.forEach(row => { map[row.section] = row.data })
        setAllData(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  const handleChange = (section: string, key: string, value: string) => {
    setAllData(prev => ({
      ...prev,
      [section]: { ...(prev[section] ?? {}), [key]: value },
    }))
  }

  const handleSave = async (section: string) => {
    setSaving(section)
    await api.patch(`/api/admin/content/${section}`, { data: allData[section] ?? {} })
    setSaving(null)
    setSaved(section)
    setTimeout(() => setSaved(null), 2500)
  }

  const inputCls  = 'w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body transition-colors text-sm'
  const labelCls  = 'label block mb-2'

  if (loading) return (
    <div className="card p-12 text-center bg-surface-container">
      <p className="label">Chargement...</p>
    </div>
  )

  return (
    <div>
      <p className="label mb-1">GESTION</p>
      <h1 className="headline-md text-white mb-2">Contenu des pages</h1>
      <p className="font-body text-on-surface-muted text-sm mb-8">
        Modifiez ici tous les textes du site sans toucher au code. Les modifications sont appliquées immédiatement.
      </p>

      <div className="space-y-8">
        {SECTIONS.map(def => {
          const data    = allData[def.section] ?? {}
          const isSaving = saving === def.section
          const isSaved  = saved  === def.section

          const simpleFields = def.columns === 2
            ? def.fields.filter(f => f.type === 'text')
            : null
          const textareaFields = def.columns === 2
            ? def.fields.filter(f => f.type === 'textarea')
            : null

          return (
            <div key={def.section} className="card p-8 bg-surface-container">

              {/* En-tête de section */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-headline font-bold text-white text-base mb-1">{def.title}</h2>
                  <p className="font-body text-on-surface-muted text-xs">{def.description}</p>
                </div>
                <button
                  onClick={() => handleSave(def.section)}
                  disabled={isSaving}
                  className={`flex items-center gap-2 font-body font-bold text-xs uppercase tracking-[0.1em] px-5 py-2.5 transition-colors shrink-0 ml-6 ${
                    isSaved
                      ? 'bg-brand/20 text-brand border border-brand/40'
                      : 'bg-brand text-black hover:bg-brand-dark'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: '0.9rem' }}>progress_activity</span>
                      Sauvegarde…
                    </>
                  ) : isSaved ? (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>check</span>
                      Sauvegardé
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>save</span>
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>

              {/* Champs — layout adapté */}
              {def.columns === 2 ? (
                <div className="space-y-4">
                  {/* Textareas en pleine largeur d'abord */}
                  {textareaFields?.map(f => (
                    <div key={f.key}>
                      <label className={labelCls}>{f.label}</label>
                      <textarea
                        rows={3}
                        value={data[f.key] ?? ''}
                        placeholder={f.placeholder}
                        onChange={e => handleChange(def.section, f.key, e.target.value)}
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                  ))}
                  {/* Champs texte en grille 2 colonnes */}
                  {simpleFields && simpleFields.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {simpleFields.map(f => (
                        <div key={f.key}>
                          <label className={labelCls}>{f.label}</label>
                          <input
                            type="text"
                            value={data[f.key] ?? ''}
                            placeholder={f.placeholder}
                            onChange={e => handleChange(def.section, f.key, e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {def.fields.map(f => (
                    <div key={f.key}>
                      <label className={labelCls}>{f.label}</label>
                      {f.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          value={data[f.key] ?? ''}
                          placeholder={f.placeholder}
                          onChange={e => handleChange(def.section, f.key, e.target.value)}
                          className={`${inputCls} resize-none`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={data[f.key] ?? ''}
                          placeholder={f.placeholder}
                          onChange={e => handleChange(def.section, f.key, e.target.value)}
                          className={inputCls}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
