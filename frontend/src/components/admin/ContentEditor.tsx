'use client'

interface Props {
  value: string
  type: 'TEXT' | 'RICH_TEXT'
  onChange: (value: string) => void
}

export default function ContentEditor({ value, type, onChange }: Props) {
  if (type === 'RICH_TEXT') {
    return (
      <div>
        <textarea
          rows={6}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body resize-y"
          placeholder="Contenu HTML ou texte enrichi..."
        />
        <p className="font-body text-on-surface-muted text-xs mt-1">Supporte le HTML basique</p>
      </div>
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-surface border border-white/10 focus:border-brand text-on-surface px-4 py-3 outline-none font-body"
    />
  )
}
