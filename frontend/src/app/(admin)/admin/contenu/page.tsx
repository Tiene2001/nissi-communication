'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import api from '@/lib/api'

interface Field {
  key:          string
  label:        string
  type:         'text' | 'textarea'
  placeholder?: string
}

interface SectionDef {
  section:     string
  title:       string
  description: string
  fields:      Field[]
  columns?:    1 | 2
  hasStats?:   boolean
}

const SECTIONS: SectionDef[] = [
  {
    section:     'hero',
    title:       'Section Hero — Qui nous sommes',
    description: "Textes et chiffres clés de la section principale sous l'image d'accueil",
    hasStats:    true,
    fields: [
      { key: 'title',       label: 'Titre orange (gauche)',       type: 'text',     placeholder: 'Les esprits de la com' },
      { key: 'description', label: 'Texte de présentation',       type: 'textarea', placeholder: "Cabinet de conseil…" },
      { key: 'tagline',     label: 'Accroche en italique orange', type: 'text',     placeholder: 'Invoquez les Esprits et prenez le pouvoir !' },
    ],
    columns: 2,
  },
]

type Stat     = { number: string; label: string }
type AllData  = Record<string, Record<string, string>>

export default function AdminContenuPage() {
  const { data: session } = useSession()
  const [allData,    setAllData]    = useState<AllData>({})
  const [heroStats,  setHeroStats]  = useState<Stat[]>([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState<string | null>(null)
  const [saved,      setSaved]      = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    api.get('/api/admin/content')
      .then(r => {
        const map: AllData = {}
        const rows: { section: string; data: any }[] = r.data
        rows.forEach(row => { map[row.section] = row.data })
        setAllData(map)

        // Charger les stats hero (nouveau ou ancien format)
        const hero = map['hero'] ?? {}
        if (Array.isArray(hero.stats)) {
          setHeroStats(hero.stats)
        } else {
          // Migration depuis l'ancien format stat1_number / stat1_label
          const migrated: Stat[] = []
          for (let i = 1; i <= 8; i++) {
            const num = hero[`stat${i}_number`]
            const lbl = hero[`stat${i}_label`]
            if (num || lbl) migrated.push({ number: num ?? '', label: lbl ?? '' })
          }
          setHeroStats(migrated)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  const handleChange = (section: string, key: string, value: string) =>
    setAllData(prev => ({ ...prev, [section]: { ...(prev[section] ?? {}), [key]: value } }))

  const handleSave = async (section: string) => {
    setSaving(section)
    const data: any = { ...(allData[section] ?? {}) }

    if (section === 'hero') {
      data.stats = heroStats.filter(s => s.number || s.label)
      // Nettoyer l'ancien format s'il existe encore
      for (let i = 1; i <= 8; i++) {
        delete data[`stat${i}_number`]
        delete data[`stat${i}_label`]
      }
    }

    await api.patch(`/api/admin/content/${section}`, { data })
    setSaving(null)
    setSaved(section)
    setTimeout(() => setSaved(null), 2500)
  }

  const addStat    = () => setHeroStats(s => [...s, { number: '', label: '' }])
  const removeStat = (i: number) => setHeroStats(s => s.filter((_, j) => j !== i))
  const updateStat = (i: number, field: keyof Stat, value: string) =>
    setHeroStats(s => s.map((x, j) => j === i ? { ...x, [field]: value } : x))

  const inputCls = 'w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body transition-colors text-sm'
  const labelCls = 'label block mb-2'

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
          const data     = allData[def.section] ?? {}
          const isSaving = saving === def.section
          const isSaved  = saved  === def.section

          const textareaFields = def.fields.filter(f => f.type === 'textarea')
          const textFields     = def.fields.filter(f => f.type === 'text')

          return (
            <div key={def.section} className="card p-8 bg-surface-container">

              {/* En-tête */}
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
                    <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '0.9rem' }}>progress_activity</span>Sauvegarde…</>
                  ) : isSaved ? (
                    <><span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>check</span>Sauvegardé</>
                  ) : (
                    <><span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>save</span>Sauvegarder</>
                  )}
                </button>
              </div>

              {/* Champs texte et textarea */}
              <div className="space-y-4">
                {textareaFields.map(f => (
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

                {textFields.length > 0 && (
                  <div className={`grid gap-4 ${def.columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {textFields.map(f => (
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

              {/* Éditeur de chiffres clés dynamique */}
              {def.hasStats && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={labelCls}>CHIFFRES CLÉS</p>
                      <p className="font-body text-on-surface-muted text-xs">
                        Affichés sous la section de présentation — ajoutez ou supprimez librement
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addStat}
                      className="font-body text-xs text-brand hover:underline uppercase tracking-widest"
                    >
                      + Ajouter
                    </button>
                  </div>

                  {heroStats.length === 0 ? (
                    <div className="border border-dashed border-white/10 p-6 text-center">
                      <p className="label text-on-surface-muted text-xs">Aucun chiffre clé — cliquer sur « Ajouter »</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* En-tête colonnes */}
                      <div className="grid grid-cols-[1fr_2fr_auto] gap-3">
                        <p className="label text-xs text-on-surface-muted">CHIFFRE</p>
                        <p className="label text-xs text-on-surface-muted">LABEL</p>
                        <span />
                      </div>
                      {heroStats.map((stat, i) => (
                        <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-center">
                          <input
                            type="text"
                            value={stat.number}
                            placeholder="50+"
                            onChange={e => updateStat(i, 'number', e.target.value)}
                            className={inputCls}
                          />
                          <input
                            type="text"
                            value={stat.label}
                            placeholder="Projets réalisés"
                            onChange={e => updateStat(i, 'label', e.target.value)}
                            className={inputCls}
                          />
                          <button
                            type="button"
                            onClick={() => removeStat(i)}
                            className="font-body text-xs text-on-surface-muted hover:text-red-400 transition-colors uppercase px-2"
                          >
                            Supp.
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
