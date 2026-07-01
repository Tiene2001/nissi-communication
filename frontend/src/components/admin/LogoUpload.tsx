'use client'
import { useState, useRef } from 'react'
import api from '@/lib/api'

interface Props {
  onUploaded: (url: string) => void
}

type Status = 'idle' | 'processing' | 'uploading'

export default function LogoUpload({ onUploaded }: Props) {
  const [status,   setStatus]   = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [error,    setError]    = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Seules les images sont acceptées pour un logo.')
      return
    }
    setError('')
    setPreview(null)
    setStatus('processing')

    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(file, {
        output: { format: 'image/png', quality: 1 },
      })

      const previewUrl = URL.createObjectURL(blob)
      setPreview(previewUrl)

      setStatus('uploading')
      setProgress(0)

      const processed = new File([blob], `logo-${Date.now()}.png`, { type: 'image/png' })
      const form = new FormData()
      form.append('file', processed)

      const res = await api.post('/api/admin/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total))
        },
      })

      onUploaded(res.data.url)
      setStatus('idle')
      setPreview(null)
    } catch {
      setError("Erreur lors du traitement — réessaie ou vérifie ta connexion.")
      setStatus('idle')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => status === 'idle' && inputRef.current?.click()}
        className={`border border-dashed border-white/20 p-8 text-center transition-colors ${
          status === 'idle' ? 'hover:border-brand cursor-pointer' : 'cursor-default'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleChange}
          className="hidden"
        />

        {status === 'processing' && (
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-brand animate-spin" style={{ fontSize: '2rem' }}>
              progress_activity
            </span>
            <p className="label text-brand">SUPPRESSION DE L&apos;ARRIÈRE-PLAN…</p>
            <p className="font-body text-on-surface-muted text-xs">
              Traitement IA en cours — première utilisation peut prendre quelques secondes
            </p>
          </div>
        )}

        {status === 'uploading' && (
          <div>
            {preview && (
              <div
                className="w-24 h-24 mx-auto mb-4 flex items-center justify-center"
                style={{
                  backgroundImage: 'linear-gradient(45deg,#444 25%,transparent 25%),linear-gradient(-45deg,#444 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#444 75%),linear-gradient(-45deg,transparent 75%,#444 75%)',
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0,0 6px,6px -6px,-6px 0',
                }}
              >
                <img src={preview} alt="Logo sans fond" className="max-h-20 max-w-20 object-contain" />
              </div>
            )}
            <p className="label mb-3">UPLOAD EN COURS…</p>
            <div className="w-full bg-surface-container h-1">
              <div className="bg-brand h-1 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="font-body text-on-surface-muted text-xs mt-2">{progress}%</p>
          </div>
        )}

        {status === 'idle' && (
          <div>
            <span className="material-symbols-outlined text-on-surface-muted mb-2" style={{ fontSize: '2rem' }}>
              auto_fix_high
            </span>
            <p className="label">AJOUTER UN LOGO</p>
            <p className="font-body text-on-surface-muted text-xs mt-2">
              JPG, PNG, WEBP · L&apos;arrière-plan sera supprimé automatiquement
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 font-body text-xs mt-2">{error}</p>}
    </div>
  )
}
