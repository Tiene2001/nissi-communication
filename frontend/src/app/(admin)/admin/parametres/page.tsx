'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import api from '@/lib/api'

interface Settings {
  /* Notifications */
  notificationEmail:  string
  notificationEmail2: string
  notificationEmail3: string
  /* Métadonnées SEO */
  siteTitle:         string
  siteDescription:   string
  /* Contacts affichés dans le footer */
  phone1:            string
  phone2:            string
  address:           string
  /* Réseaux sociaux */
  socialFacebook:    string
  socialTikTok:      string
  socialLinkedin:    string
  socialInstagram:   string
}

const EMPTY: Settings = {
  notificationEmail:  '',
  notificationEmail2: '',
  notificationEmail3: '',
  siteTitle:         '',
  siteDescription:   '',
  phone1:            '',
  phone2:            '',
  address:           '',
  socialFacebook:    '',
  socialTikTok:      '',
  socialLinkedin:    '',
  socialInstagram:   '',
}

export default function AdminParametresPage() {
  const { data: session }           = useSession()
  const [settings, setSettings]     = useState<Settings>(EMPTY)
  const [loading, setLoading]       = useState(true)
  const [saving,  setSaving]        = useState(false)
  const [saved,   setSaved]         = useState(false)

  useEffect(() => {
    if (!session) return
    api.get('/api/content/settings')
      .then(r => setSettings({ ...EMPTY, ...(r.data.data ?? r.data) }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/api/admin/content/settings', { data: settings })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Erreur lors de la sauvegarde des paramètres')
    } finally {
      setSaving(false)
    }
  }

  const set = (key: keyof Settings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setSettings(s => ({ ...s, [key]: e.target.value }))

  const inputCls = 'w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body transition-colors'

  if (loading) return (
    <div className="card p-12 text-center bg-surface-container">
      <p className="label">Chargement...</p>
    </div>
  )

  return (
    <div>
      <p className="label mb-1">CONFIGURATION</p>
      <h1 className="headline-md text-white mb-8">Paramètres</h1>

      <form onSubmit={handleSubmit}>

        {/* ── Grille 2 colonnes ── */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* Colonne gauche */}
          <div className="space-y-6">

            {/* Notifications */}
            <div className="card p-8 bg-surface-container">
              <h2 className="label mb-2">NOTIFICATIONS</h2>
              <p className="font-body text-on-surface-muted text-xs mb-6">
                Jusqu'à 3 adresses recevront les nouvelles demandes de contact
              </p>
              <div className="space-y-4">
                {([
                  { key: 'notificationEmail'  as const, label: 'EMAIL 1 (principal) *' },
                  { key: 'notificationEmail2' as const, label: 'EMAIL 2 (optionnel)'   },
                  { key: 'notificationEmail3' as const, label: 'EMAIL 3 (optionnel)'   },
                ] as const).map(({ key, label }) => (
                  <div key={key}>
                    <label className="label block mb-2">{label}</label>
                    <input
                      type="email"
                      value={settings[key]}
                      onChange={set(key)}
                      placeholder="exemple@domaine.com"
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SEO */}
            <div className="card p-8 bg-surface-container">
              <h2 className="label mb-6">MÉTADONNÉES DU SITE (SEO)</h2>
              <div className="space-y-4">
                <div>
                  <label className="label block mb-2">TITRE DU SITE</label>
                  <input type="text" value={settings.siteTitle} onChange={set('siteTitle')} className={inputCls} />
                </div>
                <div>
                  <label className="label block mb-2">DESCRIPTION</label>
                  <textarea
                    rows={4} value={settings.siteDescription} onChange={set('siteDescription')}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Colonne droite */}
          <div className="space-y-6">

            {/* Coordonnées */}
            <div className="card p-8 bg-surface-container">
              <h2 className="label mb-2">COORDONNÉES</h2>
              <p className="font-body text-on-surface-muted text-xs mb-6">
                Affichées dans le pied de page du site
              </p>
              <div className="space-y-4">
                <div>
                  <label className="label block mb-2">TÉLÉPHONE 1</label>
                  <input
                    type="tel" value={settings.phone1} onChange={set('phone1')}
                    placeholder="+225 07 XX XX XX XX"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="label block mb-2">TÉLÉPHONE 2</label>
                  <input
                    type="tel" value={settings.phone2} onChange={set('phone2')}
                    placeholder="+225 05 XX XX XX XX"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="label block mb-2">ADRESSE</label>
                  <textarea
                    rows={3} value={settings.address} onChange={set('address')}
                    placeholder={'Abidjan, Cocody, II Plateau\nCité les Versants 2, Rue Du Bandaman'}
                    className={`${inputCls} resize-none`}
                  />
                  <p className="font-body text-on-surface-muted text-xs mt-1">
                    Retour à la ligne possible (chaque ligne s'affiche séparément)
                  </p>
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="card p-8 bg-surface-container">
              <h2 className="label mb-2">RÉSEAUX SOCIAUX</h2>
              <p className="font-body text-on-surface-muted text-xs mb-6">
                Seuls les champs renseignés apparaissent dans le footer
              </p>
              <div className="space-y-4">
                {[
                  { key: 'socialFacebook'  as const, label: 'FACEBOOK URL'  },
                  { key: 'socialTikTok'    as const, label: 'TIKTOK URL'    },
                  { key: 'socialLinkedin'  as const, label: 'LINKEDIN URL'  },
                  { key: 'socialInstagram' as const, label: 'INSTAGRAM URL' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="label block mb-2">{label}</label>
                    <input
                      type="url" value={settings[key]} onChange={set(key)}
                      placeholder="https://"
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? 'SAUVEGARDE...' : 'SAUVEGARDER LES PARAMÈTRES'}
          </button>
          {saved && (
            <p className="font-body text-brand text-sm">Paramètres sauvegardés !</p>
          )}
        </div>
      </form>
    </div>
  )
}
